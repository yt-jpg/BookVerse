import express from 'express';
import Notification from '../models/Notification.js';
import auth from '../middleware/auth.js';
import { adminAuth } from '../middleware/auth.js';
import { sendRealTimeNotification, broadcastNotification } from '../websocket/socketManager.js';

const router = express.Router();

// Obter notificações do usuário
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.mongoConnected) {
      // Modo MongoDB
      const notifications = await Notification.find({
        $or: [
          { isGlobal: true },
          { targetUsers: userId }
        ],
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

      // Marcar como lidas
      const unreadNotifications = notifications.filter(notification => 
        !notification.readBy.some(read => read.user.toString() === userId)
      );

      res.json({
        notifications: notifications.map(notification => ({
          id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          createdBy: notification.createdBy.name,
          createdAt: notification.createdAt,
          isRead: notification.readBy.some(read => read.user.toString() === userId)
        })),
        unreadCount: unreadNotifications.length
      });
    } else if (req.db) {
      // Modo MySQL
      const query = `
        SELECT n.*, u.name as createdByName,
               CASE WHEN nr.user_id IS NOT NULL THEN 1 ELSE 0 END as isRead
        FROM notifications n
        LEFT JOIN users u ON n.created_by = u.id
        LEFT JOIN notification_reads nr ON n.id = nr.notification_id AND nr.user_id = ?
        WHERE (n.is_global = 1 OR FIND_IN_SET(?, n.target_users))
          AND (n.expires_at IS NULL OR n.expires_at > NOW())
        ORDER BY n.created_at DESC
        LIMIT 50
      `;

      req.db.query(query, [userId, userId], (err, results) => {
        if (err) {
          console.error('Erro ao buscar notificações:', err);
          return res.status(500).json({ message: 'Erro ao buscar notificações' });
        }

        const notifications = results.map(row => ({
          id: row.id,
          title: row.title,
          message: row.message,
          type: row.type,
          createdBy: row.createdByName,
          createdAt: row.created_at,
          isRead: row.isRead === 1
        }));

        const unreadCount = notifications.filter(n => !n.isRead).length;

        res.json({ notifications, unreadCount });
      });
    } else {
      // Modo memória
      const notifications = req.memoryDB.notifications || [];
      const userNotifications = notifications.filter(notification => 
        notification.isGlobal || notification.targetUsers.includes(userId)
      );

      const unreadCount = userNotifications.filter(n => 
        !n.readBy.includes(userId)
      ).length;

      res.json({
        notifications: userNotifications.map(n => ({
          ...n,
          isRead: n.readBy.includes(userId)
        })),
        unreadCount
      });
    }
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ message: 'Erro do servidor' });
  }
});

// Marcar notificação como lida
router.put('/:id/read', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    if (req.mongoConnected) {
      // Modo MongoDB
      await Notification.findByIdAndUpdate(
        notificationId,
        {
          $addToSet: {
            readBy: {
              user: userId,
              readAt: new Date()
            }
          }
        }
      );
    } else if (req.db) {
      // Modo MySQL
      req.db.query(
        'INSERT IGNORE INTO notification_reads (notification_id, user_id) VALUES (?, ?)',
        [notificationId, userId],
        (err) => {
          if (err) {
            console.error('Erro ao marcar notificação como lida:', err);
            return res.status(500).json({ message: 'Erro ao marcar como lida' });
          }
        }
      );
    } else {
      // Modo memória
      const notification = req.memoryDB.notifications?.find(n => n.id === notificationId);
      if (notification && !notification.readBy.includes(userId)) {
        notification.readBy.push(userId);
      }
    }

    res.json({ message: 'Notificação marcada como lida' });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({ message: 'Erro do servidor' });
  }
});

// Marcar todas as notificações como lidas
router.put('/read-all', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.mongoConnected) {
      // Modo MongoDB
      await Notification.updateMany(
        {
          $or: [
            { isGlobal: true },
            { targetUsers: userId }
          ],
          'readBy.user': { $ne: userId }
        },
        {
          $addToSet: {
            readBy: {
              user: userId,
              readAt: new Date()
            }
          }
        }
      );
    } else if (req.db) {
      // Modo MySQL
      const query = `
        INSERT IGNORE INTO notification_reads (notification_id, user_id)
        SELECT n.id, ? FROM notifications n
        WHERE (n.is_global = 1 OR FIND_IN_SET(?, n.target_users))
          AND NOT EXISTS (
            SELECT 1 FROM notification_reads nr 
            WHERE nr.notification_id = n.id AND nr.user_id = ?
          )
      `;
      
      req.db.query(query, [userId, userId, userId], (err) => {
        if (err) {
          console.error('Erro ao marcar todas como lidas:', err);
          return res.status(500).json({ message: 'Erro ao marcar todas como lidas' });
        }
      });
    } else {
      // Modo memória
      const notifications = req.memoryDB.notifications || [];
      notifications.forEach(notification => {
        if ((notification.isGlobal || notification.targetUsers.includes(userId)) &&
            !notification.readBy.includes(userId)) {
          notification.readBy.push(userId);
        }
      });
    }

    res.json({ message: 'Todas as notificações foram marcadas como lidas' });
  } catch (error) {
    console.error('Erro ao marcar todas como lidas:', error);
    res.status(500).json({ message: 'Erro do servidor' });
  }
});

// Criar notificação (apenas admins)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { title, message, type, targetUsers, isGlobal, expiresAt } = req.body;
    const createdBy = req.user.id;

    if (req.mongoConnected) {
      // Modo MongoDB
      const notification = new Notification({
        title,
        message,
        type: type || 'info',
        targetUsers: isGlobal ? [] : targetUsers,
        isGlobal: isGlobal || false,
        createdBy,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      });

      await notification.save();
      
      // Enviar notificação em tempo real
      const notificationData = {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        createdBy: req.user.name,
        createdAt: notification.createdAt,
        isRead: false
      };

      if (isGlobal) {
        broadcastNotification(notificationData);
      } else if (targetUsers && targetUsers.length > 0) {
        targetUsers.forEach(userId => {
          sendRealTimeNotification(userId, notificationData);
        });
      }

      res.json({ message: 'Notificação criada com sucesso', notification });
    } else if (req.db) {
      // Modo MySQL
      const query = `
        INSERT INTO notifications (title, message, type, target_users, is_global, created_by, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      req.db.query(query, [
        title,
        message,
        type || 'info',
        isGlobal ? null : (targetUsers || []).join(','),
        isGlobal || false,
        createdBy,
        expiresAt || null
      ], (err, result) => {
        if (err) {
          console.error('Erro ao criar notificação:', err);
          return res.status(500).json({ message: 'Erro ao criar notificação' });
        }

        res.json({ message: 'Notificação criada com sucesso', id: result.insertId });
      });
    } else {
      // Modo memória
      if (!req.memoryDB.notifications) {
        req.memoryDB.notifications = [];
      }

      const notification = {
        id: Date.now().toString(),
        title,
        message,
        type: type || 'info',
        targetUsers: isGlobal ? [] : (targetUsers || []),
        isGlobal: isGlobal || false,
        createdBy,
        readBy: [],
        createdAt: new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null
      };

      req.memoryDB.notifications.push(notification);
      res.json({ message: 'Notificação criada com sucesso', notification });
    }
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    res.status(500).json({ message: 'Erro do servidor' });
  }
});

export default router;