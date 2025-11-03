import express from 'express';
import multer from 'multer';
import path from 'path';
import Book from '../models/Book.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Buscar livros
router.get('/search', async (req, res) => {
  try {
    const { query, category } = req.query;
    let searchQuery = { status: 'approved' };

    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } }
      ];
    }

    if (category) {
      searchQuery.category = category;
    }

    const books = await Book.find(searchQuery)
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(books);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro do servidor');
  }
});

// Adicionar livro
router.post('/add', auth, upload.single('bookFile'), async (req, res) => {
  try {
    const { title, author, description, category, downloadLinks } = req.body;

    const bookData = {
      title,
      author,
      description,
      category,
      addedBy: req.user.id
    };

    // Se há links de download
    if (downloadLinks) {
      bookData.downloadLinks = JSON.parse(downloadLinks).map(link => ({
        ...link,
        addedBy: req.user.id
      }));
    }

    // Se há arquivo enviado
    if (req.file) {
      bookData.uploadedFile = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path
      };
    }

    const book = new Book(bookData);
    await book.save();

    res.json({ message: 'Livro adicionado com sucesso', book });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro do servidor');
  }
});

// Download de livro
router.post('/download/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Livro não encontrado' });
    }

    // Incrementar contador de downloads
    book.downloads += 1;
    await book.save();

    res.json({ message: 'Download registrado' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro do servidor');
  }
});

export default router;