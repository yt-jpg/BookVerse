import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/profile');
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      console.error('Erro ao recarregar usuário:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao recarregar perfil' 
      };
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      
      const userData = localStorage.getItem('user');
      if (userData && userData !== 'undefined') {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          // Tentar recarregar dados do servidor para garantir sincronização
          refreshUser().catch(error => {
            console.warn('Não foi possível recarregar dados do usuário:', error);
            // Manter dados locais
          });
        } catch (error) {
          console.error('Erro ao fazer parse dos dados do usuário:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['x-auth-token'] = token;
      
      setUser(user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao fazer login' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password
      });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['x-auth-token'] = token;
      
      setUser(user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao criar conta' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['x-auth-token'];
    setUser(null);
  };

  const updateUser = async (userData) => {
    try {
      console.log('Enviando dados para atualização:', userData);
      const response = await axios.put('http://localhost:5000/api/auth/profile', userData);
      
      if (response.status === 200) {
        const updatedUser = { ...user, ...userData };
        console.log('Usuário atualizado:', updatedUser);
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      } else {
        throw new Error('Falha na atualização');
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw new Error(error.response?.data?.message || 'Erro ao atualizar perfil');
    }
  };

  const deleteAccount = async () => {
    try {
      await axios.delete('http://localhost:5000/api/auth/account');
      logout();
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao deletar conta' 
      };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    deleteAccount,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};