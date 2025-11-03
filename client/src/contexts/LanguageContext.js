import { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  return useContext(LanguageContext);
};

const languages = {
  'pt-br': {
    code: 'pt-br',
    name: 'Português',
    flag: 'https://flagcdn.com/w20/br.png',
    translations: {
      // App Name
      appName: 'BookVerse',
      appSubtitle: 'Universo dos Livros',
      
      // Auth
      welcomeBack: 'Bem-vindo de volta!',
      enterAccount: 'Entre na sua conta para continuar',
      email: '📧 Email:',
      password: '🔒 Senha:',
      forgotPassword: 'Esqueceu a senha?',
      login: '🚀 Entrar',
      loginLoading: 'Entrando...',
      noAccount: 'Não tem uma conta?',
      createFreeAccount: '✨ Criar conta gratuita',
      
      // Register
      joinBookVerse: 'Junte-se ao BookVerse!',
      createAccountExplore: 'Crie sua conta e explore o universo dos livros',
      fullName: '👤 Nome completo:',
      fullNamePlaceholder: 'Seu nome completo',
      emailPlaceholder: 'seu@email.com',
      passwordPlaceholder: 'Mínimo 6 caracteres',
      confirmPasswordPlaceholder: 'Repita sua senha',
      confirmPassword: '🔐 Confirmar senha:',
      createAccount: '🎉 Criar minha conta',
      registerLoading: 'Criando conta...',
      alreadyHaveAccount: 'Já tem uma conta?',
      makeLogin: '🔑 Fazer login',
      passwordsDontMatch: 'As senhas não coincidem',
      completeCaptcha: 'Por favor, complete a verificação de segurança',
      or: 'ou',
      
      // Captcha
      securityVerification: '🤖 Verificação de segurança:',
      enterCodeAbove: 'Digite o código acima',
      incorrectCode: '🤖 Código Incorreto',
      checkCodeTryAgain: 'Verifique o código e tente novamente',
      
      // Forgot Password
      forgotPasswordTitle: 'Esqueceu sua senha?',
      forgotPasswordSubtitle: 'Não se preocupe! Digite seu email e enviaremos instruções para redefinir sua senha.',
      sendInstructions: 'Enviar instruções',
      sendingInstructions: 'Enviando...',
      rememberedPassword: 'Lembrou da senha?',
      errorProcessingRequest: 'Erro ao processar solicitação. Tente novamente.',
      
      // Password Input
      showPassword: 'Mostrar senha',
      hidePassword: 'Ocultar senha',
      
      // Dashboard
      hello: 'Olá',
      searchBooks: '🔍 Buscar Livros',
      shareBook: '📚 Compartilhar Livro',
      adminPanel: '⚙️ Painel Admin',
      exit: '🚪 Sair',
      
      // Search
      searchPlaceholder: 'Buscar por título ou autor...',
      allCategories: 'Todas as categorias',
      searchButton: 'Buscar',
      loading: 'Carregando...',
      noResults: 'Nenhum livro encontrado. Tente uma busca diferente.',
      downloads: 'Downloads',
      addedBy: 'Adicionado por',
      downloadLinks: 'Links de Download',
      downloadFile: 'Baixar Arquivo',
      
      // Add Book
      shareBookTitle: 'Compartilhar Livro',
      bookTitle: 'Título',
      author: 'Autor',
      description: 'Descrição',
      category: 'Categoria',
      selectCategory: 'Selecione uma categoria',
      downloadLinksSection: 'Links de Download',
      urlPlaceholder: 'URL do download',
      formatPlaceholder: 'Formato (PDF, EPUB, etc.)',
      addLink: 'Adicionar Link',
      removeLink: 'Remover',
      orSendFile: 'Ou envie o arquivo',
      shareBookButton: 'Compartilhar Livro',
      sending: 'Enviando...',
      
      // Categories
      fiction: 'Ficção',
      romance: 'Romance',
      mystery: 'Mistério',
      fantasy: 'Fantasia',
      biography: 'Biografia',
      history: 'História',
      science: 'Ciência',
      technology: 'Tecnologia',
      selfHelp: 'Autoajuda',
      education: 'Educação',
      
      // Theme
      darkMode: 'Modo escuro',
      lightMode: 'Modo claro',
      
      // Language
      language: 'Idioma',
      
      // Navigation
      goBack: 'Voltar',
      
      // Modal
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      emailNotFound: 'Email não encontrado',
      emailNotFoundMessage: 'O email informado não existe em nossa plataforma. Deseja criar uma conta?',
      createAccountModal: 'Criar Conta',
      emailSent: 'Email enviado!',
      emailSentMessage: 'Se este email estiver cadastrado, você receberá instruções para redefinir sua senha.',
      
      // Admin
      adminDashboard: 'Painel Administrativo',
      overview: 'Visão Geral',
      manageBooks: 'Gerenciar Livros',
      users: 'Usuários',
      totalUsers: 'Total de Usuários',
      totalBooks: 'Total de Livros',
      pendingBooks: 'Livros Pendentes',
      totalDownloads: 'Total de Downloads',
      approve: 'Aprovar',
      reject: 'Rejeitar',
      delete: 'Deletar',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
      pending: 'Pendente',
      
      // Dashboard
      dashboard: 'Dashboard',
      myLibrary: 'Minha Biblioteca',
      welcomeBackDashboard: 'Bem-vindo de volta',
      exploreLibrary: 'Explore nossa biblioteca digital e compartilhe conhecimento',
      exploreBooks: 'Explorar Livros',
      shareBookAction: 'Compartilhar Livro',
      booksAvailable: 'Livros Disponíveis',
      booksShared: 'Livros Compartilhados',
      downloadsCompleted: 'Downloads Realizados',
      accountStatus: 'Status da Conta',
      active: 'Ativo',
      recentActivity: 'Atividade Recente',
      quickActions: 'Ações Rápidas',
      searchByCategory: 'Buscar por Categoria',
      newBook: 'Novo Livro',
      myBooks: 'Meus Livros',
      favorites: 'Favoritos',
      
      // User roles
      supremeAdmin: 'Administrador Supremo',
      administrator: 'Administrador',
      moderator: 'Moderador',
      vip2: 'VIP 2',
      vip1: 'VIP 1',
      user: 'Usuário',
      
      // Navigation
      explore: 'Explorar',
      share: 'Compartilhar',
      library: 'Biblioteca',
      
      // Page subtitles
      dashboardOverview: 'Visão geral da sua biblioteca',
      findAmazingBooks: 'Encontre livros incríveis',
      shareKnowledge: 'Compartilhe conhecimento',
      yourFavoriteBooks: 'Seus livros favoritos',
      
      // Profile menu
      myProfile: 'Meu Perfil',
      myLibraryMenu: 'Minha Biblioteca',
      favoritesMenu: 'Favoritos',
      downloadsMenu: 'Downloads',
      settings: 'Configurações',
      adminPanelMenu: 'Painel Admin',
      logout: 'Sair',
      
      // Activity
      download: 'Download',
      shared: 'Compartilhou',
      hoursAgo: 'horas atrás',
      dayAgo: 'dia atrás',
      daysAgo: 'dias atrás',
      
      // Notifications
      notifications: 'Notificações',
      noNotifications: 'Nenhuma notificação',
      markAllAsRead: 'Marcar todas como lidas',
      refresh: 'Atualizar',
      loadingNotifications: 'Carregando...',
      now: 'Agora',
      minutesAgo: 'min atrás',
      hoursAgoShort: 'h atrás',
      daysAgoShort: 'd atrás',
      by: 'Por',
      toastActivated: 'Toast Ativado',
      toastActivatedMessage: 'As notificações toast estão agora habilitadas!',
      testToast: 'Teste de Toast',
      testToastMessage: 'Esta é uma notificação de teste!',
      debugForced: 'DEBUG FORÇADO',
      debugForcedMessage: 'Toast forçado para debug - deve aparecer!',
      testSound: 'Testar som',
      testToastButton: 'Testar toast',
      debugForcedButton: 'Debug forçado',
      enableToast: 'Ativar toast',
      disableToast: 'Desativar toast',
      enableSound: 'Ativar som',
      disableSound: 'Desativar som',
      toast: 'Toast',
      sound: 'Som'
    }
  },
  'en': {
    code: 'en',
    name: 'English',
    flag: 'https://flagcdn.com/w20/us.png',
    translations: {
      // App Name
      appName: 'BookVerse',
      appSubtitle: 'Universe of Books',
      
      // Auth
      welcomeBack: 'Welcome back!',
      enterAccount: 'Sign in to your account to continue',
      email: '📧 Email:',
      password: '🔒 Password:',
      forgotPassword: 'Forgot password?',
      login: '🚀 Sign In',
      loginLoading: 'Signing in...',
      noAccount: "Don't have an account?",
      createFreeAccount: '✨ Create free account',
      
      // Register
      joinBookVerse: 'Join BookVerse!',
      createAccountExplore: 'Create your account and explore the universe of books',
      fullName: '👤 Full name:',
      fullNamePlaceholder: 'Your full name',
      emailPlaceholder: 'your@email.com',
      passwordPlaceholder: 'Minimum 6 characters',
      confirmPasswordPlaceholder: 'Repeat your password',
      confirmPassword: '🔐 Confirm password:',
      createAccount: '🎉 Create my account',
      registerLoading: 'Creating account...',
      alreadyHaveAccount: 'Already have an account?',
      makeLogin: '🔑 Sign in',
      passwordsDontMatch: 'Passwords do not match',
      completeCaptcha: 'Please complete the security verification',
      or: 'or',
      
      // Captcha
      securityVerification: '🤖 Security verification:',
      enterCodeAbove: 'Enter the code above',
      incorrectCode: '🤖 Incorrect Code',
      checkCodeTryAgain: 'Check the code and try again',
      
      // Forgot Password
      forgotPasswordTitle: 'Forgot your password?',
      forgotPasswordSubtitle: 'Don\'t worry! Enter your email and we\'ll send instructions to reset your password.',
      sendInstructions: 'Send instructions',
      sendingInstructions: 'Sending...',
      rememberedPassword: 'Remembered your password?',
      errorProcessingRequest: 'Error processing request. Please try again.',
      
      // Password Input
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      
      // Dashboard
      hello: 'Hello',
      searchBooks: '🔍 Search Books',
      shareBook: '📚 Share Book',
      adminPanel: '⚙️ Admin Panel',
      exit: '🚪 Exit',
      
      // Search
      searchPlaceholder: 'Search by title or author...',
      allCategories: 'All categories',
      searchButton: 'Search',
      loading: 'Loading...',
      noResults: 'No books found. Try a different search.',
      downloads: 'Downloads',
      addedBy: 'Added by',
      downloadLinks: 'Download Links',
      downloadFile: 'Download File',
      
      // Add Book
      shareBookTitle: 'Share Book',
      bookTitle: 'Title',
      author: 'Author',
      description: 'Description',
      category: 'Category',
      selectCategory: 'Select a category',
      downloadLinksSection: 'Download Links',
      urlPlaceholder: 'Download URL',
      formatPlaceholder: 'Format (PDF, EPUB, etc.)',
      addLink: 'Add Link',
      removeLink: 'Remove',
      orSendFile: 'Or send file',
      shareBookButton: 'Share Book',
      sending: 'Sending...',
      
      // Categories
      fiction: 'Fiction',
      romance: 'Romance',
      mystery: 'Mystery',
      fantasy: 'Fantasy',
      biography: 'Biography',
      history: 'History',
      science: 'Science',
      technology: 'Technology',
      selfHelp: 'Self Help',
      education: 'Education',
      
      // Theme
      darkMode: 'Dark mode',
      lightMode: 'Light mode',
      
      // Language
      language: 'Language',
      
      // Navigation
      goBack: 'Go Back',
      
      // Modal
      cancel: 'Cancel',
      confirm: 'Confirm',
      emailNotFound: 'Email not found',
      emailNotFoundMessage: 'The email provided does not exist in our platform. Would you like to create an account?',
      createAccountModal: 'Create Account',
      emailSent: 'Email sent!',
      emailSentMessage: 'If this email is registered, you will receive instructions to reset your password.',
      
      // Admin
      adminDashboard: 'Admin Dashboard',
      overview: 'Overview',
      manageBooks: 'Manage Books',
      users: 'Users',
      totalUsers: 'Total Users',
      totalBooks: 'Total Books',
      pendingBooks: 'Pending Books',
      totalDownloads: 'Total Downloads',
      approve: 'Approve',
      reject: 'Reject',
      delete: 'Delete',
      approved: 'Approved',
      rejected: 'Rejected',
      pending: 'Pending',
      
      // Dashboard
      dashboard: 'Dashboard',
      myLibrary: 'My Library',
      welcomeBackDashboard: 'Welcome back',
      exploreLibrary: 'Explore our digital library and share knowledge',
      exploreBooks: 'Explore Books',
      shareBookAction: 'Share Book',
      booksAvailable: 'Books Available',
      booksShared: 'Books Shared',
      downloadsCompleted: 'Downloads Completed',
      accountStatus: 'Account Status',
      active: 'Active',
      recentActivity: 'Recent Activity',
      quickActions: 'Quick Actions',
      searchByCategory: 'Search by Category',
      newBook: 'New Book',
      myBooks: 'My Books',
      favorites: 'Favorites',
      
      // User roles
      supremeAdmin: 'Supreme Administrator',
      administrator: 'Administrator',
      moderator: 'Moderator',
      vip2: 'VIP 2',
      vip1: 'VIP 1',
      user: 'User',
      
      // Navigation
      explore: 'Explore',
      share: 'Share',
      library: 'Library',
      
      // Page subtitles
      dashboardOverview: 'Overview of your library',
      findAmazingBooks: 'Find amazing books',
      shareKnowledge: 'Share knowledge',
      yourFavoriteBooks: 'Your favorite books',
      
      // Profile menu
      myProfile: 'My Profile',
      myLibraryMenu: 'My Library',
      favoritesMenu: 'Favorites',
      downloadsMenu: 'Downloads',
      settings: 'Settings',
      adminPanelMenu: 'Admin Panel',
      logout: 'Logout',
      
      // Activity
      download: 'Download',
      shared: 'Shared',
      hoursAgo: 'hours ago',
      dayAgo: 'day ago',
      daysAgo: 'days ago',
      
      // Notifications
      notifications: 'Notifications',
      noNotifications: 'No notifications',
      markAllAsRead: 'Mark all as read',
      refresh: 'Refresh',
      loadingNotifications: 'Loading...',
      now: 'Now',
      minutesAgo: 'min ago',
      hoursAgoShort: 'h ago',
      daysAgoShort: 'd ago',
      by: 'By',
      toastActivated: 'Toast Activated',
      toastActivatedMessage: 'Toast notifications are now enabled!',
      testToast: 'Test Toast',
      testToastMessage: 'This is a test notification!',
      debugForced: 'DEBUG FORCED',
      debugForcedMessage: 'Forced toast for debug - should appear!',
      testSound: 'Test sound',
      testToastButton: 'Test toast',
      debugForcedButton: 'Forced debug',
      enableToast: 'Enable toast',
      disableToast: 'Disable toast',
      enableSound: 'Enable sound',
      disableSound: 'Disable sound',
      toast: 'Toast',
      sound: 'Sound'
    }
  },
  'ru': {
    code: 'ru',
    name: 'Русский',
    flag: 'https://flagcdn.com/w20/ru.png',
    translations: {
      // App Name
      appName: 'BookVerse',
      appSubtitle: 'Вселенная книг',
      
      // Auth
      welcomeBack: 'Добро пожаловать!',
      enterAccount: 'Войдите в свою учетную запись, чтобы продолжить',
      email: '📧 Электронная почта:',
      password: '🔒 Пароль:',
      forgotPassword: 'Забыли пароль?',
      login: '🚀 Войти',
      loginLoading: 'Вход...',
      noAccount: 'Нет аккаунта?',
      createFreeAccount: '✨ Создать бесплатный аккаунт',
      
      // Register
      joinBookVerse: 'Присоединяйтесь к BookVerse!',
      createAccountExplore: 'Создайте свой аккаунт и исследуйте вселенную книг',
      fullName: '👤 Полное имя:',
      fullNamePlaceholder: 'Ваше полное имя',
      emailPlaceholder: 'ваш@email.com',
      passwordPlaceholder: 'Минимум 6 символов',
      confirmPasswordPlaceholder: 'Повторите пароль',
      confirmPassword: '🔐 Подтвердите пароль:',
      createAccount: '🎉 Создать мой аккаунт',
      registerLoading: 'Создание аккаунта...',
      alreadyHaveAccount: 'Уже есть аккаунт?',
      makeLogin: '🔑 Войти',
      passwordsDontMatch: 'Пароли не совпадают',
      completeCaptcha: 'Пожалуйста, пройдите проверку безопасности',
      or: 'или',
      
      // Captcha
      securityVerification: '🤖 Проверка безопасности:',
      enterCodeAbove: 'Введите код выше',
      incorrectCode: '🤖 Неверный код',
      checkCodeTryAgain: 'Проверьте код и попробуйте снова',
      
      // Forgot Password
      forgotPasswordTitle: 'Забыли пароль?',
      forgotPasswordSubtitle: 'Не волнуйтесь! Введите ваш email и мы отправим инструкции для сброса пароля.',
      sendInstructions: 'Отправить инструкции',
      sendingInstructions: 'Отправка...',
      rememberedPassword: 'Вспомнили пароль?',
      errorProcessingRequest: 'Ошибка при обработке запроса. Попробуйте снова.',
      
      // Password Input
      showPassword: 'Показать пароль',
      hidePassword: 'Скрыть пароль',
      
      // Dashboard
      hello: 'Привет',
      searchBooks: '🔍 Поиск книг',
      shareBook: '📚 Поделиться книгой',
      adminPanel: '⚙️ Панель администратора',
      exit: '🚪 Выход',
      
      // Search
      searchPlaceholder: 'Поиск по названию или автору...',
      allCategories: 'Все категории',
      searchButton: 'Поиск',
      loading: 'Загрузка...',
      noResults: 'Книги не найдены. Попробуйте другой поиск.',
      downloads: 'Загрузки',
      addedBy: 'Добавлено',
      downloadLinks: 'Ссылки для скачивания',
      downloadFile: 'Скачать файл',
      
      // Add Book
      shareBookTitle: 'Поделиться книгой',
      bookTitle: 'Название',
      author: 'Автор',
      description: 'Описание',
      category: 'Категория',
      selectCategory: 'Выберите категорию',
      downloadLinksSection: 'Ссылки для скачивания',
      urlPlaceholder: 'URL для скачивания',
      formatPlaceholder: 'Формат (PDF, EPUB и т.д.)',
      addLink: 'Добавить ссылку',
      removeLink: 'Удалить',
      orSendFile: 'Или отправить файл',
      shareBookButton: 'Поделиться книгой',
      sending: 'Отправка...',
      
      // Categories
      fiction: 'Художественная литература',
      romance: 'Романтика',
      mystery: 'Детектив',
      fantasy: 'Фэнтези',
      biography: 'Биография',
      history: 'История',
      science: 'Наука',
      technology: 'Технологии',
      selfHelp: 'Саморазвитие',
      education: 'Образование',
      
      // Theme
      darkMode: 'Темный режим',
      lightMode: 'Светлый режим',
      
      // Language
      language: 'Язык',
      
      // Navigation
      goBack: 'Назад',
      
      // Modal
      cancel: 'Отмена',
      confirm: 'Подтвердить',
      emailNotFound: 'Email не найден',
      emailNotFoundMessage: 'Указанный email не существует на нашей платформе. Хотите создать аккаунт?',
      createAccountModal: 'Создать аккаунт',
      emailSent: 'Email отправлен!',
      emailSentMessage: 'Если этот email зарегистрирован, вы получите инструкции для сброса пароля.',
      
      // Admin
      adminDashboard: 'Панель администратора',
      overview: 'Обзор',
      manageBooks: 'Управление книгами',
      users: 'Пользователи',
      totalUsers: 'Всего пользователей',
      totalBooks: 'Всего книг',
      pendingBooks: 'Книги на рассмотрении',
      totalDownloads: 'Всего загрузок',
      approve: 'Одобрить',
      reject: 'Отклонить',
      delete: 'Удалить',
      approved: 'Одобрено',
      rejected: 'Отклонено',
      pending: 'На рассмотрении',
      
      // Dashboard
      dashboard: 'Панель управления',
      myLibrary: 'Моя библиотека',
      welcomeBackDashboard: 'Добро пожаловать',
      exploreLibrary: 'Исследуйте нашу цифровую библиотеку и делитесь знаниями',
      exploreBooks: 'Исследовать книги',
      shareBookAction: 'Поделиться книгой',
      booksAvailable: 'Доступные книги',
      booksShared: 'Книги поделились',
      downloadsCompleted: 'Загрузки завершены',
      accountStatus: 'Статус аккаунта',
      active: 'Активный',
      recentActivity: 'Недавняя активность',
      quickActions: 'Быстрые действия',
      searchByCategory: 'Поиск по категории',
      newBook: 'Новая книга',
      myBooks: 'Мои книги',
      favorites: 'Избранное',
      
      // User roles
      supremeAdmin: 'Верховный администратор',
      administrator: 'Администратор',
      moderator: 'Модератор',
      vip2: 'VIP 2',
      vip1: 'VIP 1',
      user: 'Пользователь',
      
      // Navigation
      explore: 'Исследовать',
      share: 'Поделиться',
      library: 'Библиотека',
      
      // Page subtitles
      dashboardOverview: 'Обзор вашей библиотеки',
      findAmazingBooks: 'Найдите удивительные книги',
      shareKnowledge: 'Поделитесь знаниями',
      yourFavoriteBooks: 'Ваши любимые книги',
      
      // Profile menu
      myProfile: 'Мой профиль',
      myLibraryMenu: 'Моя библиотека',
      favoritesMenu: 'Избранное',
      downloadsMenu: 'Загрузки',
      settings: 'Настройки',
      adminPanelMenu: 'Панель администратора',
      logout: 'Выйти',
      
      // Activity
      download: 'Загрузка',
      shared: 'Поделился',
      hoursAgo: 'часов назад',
      dayAgo: 'день назад',
      daysAgo: 'дней назад',
      
      // Notifications
      notifications: 'Уведомления',
      noNotifications: 'Нет уведомлений',
      markAllAsRead: 'Отметить все как прочитанные',
      refresh: 'Обновить',
      loadingNotifications: 'Загрузка...',
      now: 'Сейчас',
      minutesAgo: 'мин назад',
      hoursAgoShort: 'ч назад',
      daysAgoShort: 'д назад',
      by: 'От',
      toastActivated: 'Уведомления активированы',
      toastActivatedMessage: 'Всплывающие уведомления теперь включены!',
      testToast: 'Тест уведомления',
      testToastMessage: 'Это тестовое уведомление!',
      debugForced: 'ПРИНУДИТЕЛЬНАЯ ОТЛАДКА',
      debugForcedMessage: 'Принудительное уведомление для отладки - должно появиться!',
      testSound: 'Тест звука',
      testToastButton: 'Тест уведомления',
      debugForcedButton: 'Принудительная отладка',
      enableToast: 'Включить уведомления',
      disableToast: 'Отключить уведомления',
      enableSound: 'Включить звук',
      disableSound: 'Отключить звук',
      toast: 'Уведомления',
      sound: 'Звук'
    }
  },
  'es': {
    code: 'es',
    name: 'Español',
    flag: 'https://flagcdn.com/w20/es.png',
    translations: {
      // App Name
      appName: 'BookVerse',
      appSubtitle: 'Universo de Libros',
      
      // Auth
      welcomeBack: '¡Bienvenido de vuelta!',
      enterAccount: 'Inicia sesión en tu cuenta para continuar',
      email: '📧 Correo electrónico:',
      password: '🔒 Contraseña:',
      forgotPassword: '¿Olvidaste tu contraseña?',
      login: '🚀 Iniciar sesión',
      loginLoading: 'Iniciando sesión...',
      noAccount: '¿No tienes una cuenta?',
      createFreeAccount: '✨ Crear cuenta gratuita',
      
      // Register
      joinBookVerse: '¡Únete a BookVerse!',
      createAccountExplore: 'Crea tu cuenta y explora el universo de los libros',
      fullName: '👤 Nombre completo:',
      fullNamePlaceholder: 'Tu nombre completo',
      emailPlaceholder: 'tu@email.com',
      passwordPlaceholder: 'Mínimo 6 caracteres',
      confirmPasswordPlaceholder: 'Repite tu contraseña',
      confirmPassword: '🔐 Confirmar contraseña:',
      createAccount: '🎉 Crear mi cuenta',
      registerLoading: 'Creando cuenta...',
      alreadyHaveAccount: '¿Ya tienes una cuenta?',
      makeLogin: '🔑 Iniciar sesión',
      passwordsDontMatch: 'Las contraseñas no coinciden',
      completeCaptcha: 'Por favor, completa la verificación de seguridad',
      or: 'o',
      
      // Captcha
      securityVerification: '🤖 Verificación de seguridad:',
      enterCodeAbove: 'Ingresa el código de arriba',
      incorrectCode: '🤖 Código Incorrecto',
      checkCodeTryAgain: 'Verifica el código e intenta de nuevo',
      
      // Forgot Password
      forgotPasswordTitle: '¿Olvidaste tu contraseña?',
      forgotPasswordSubtitle: '¡No te preocupes! Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña.',
      sendInstructions: 'Enviar instrucciones',
      sendingInstructions: 'Enviando...',
      rememberedPassword: '¿Recordaste tu contraseña?',
      errorProcessingRequest: 'Error al procesar la solicitud. Inténtalo de nuevo.',
      
      // Password Input
      showPassword: 'Mostrar contraseña',
      hidePassword: 'Ocultar contraseña',
      
      // Dashboard
      hello: 'Hola',
      searchBooks: '🔍 Buscar libros',
      shareBook: '📚 Compartir libro',
      adminPanel: '⚙️ Panel de administración',
      exit: '🚪 Salir',
      
      // Search
      searchPlaceholder: 'Buscar por título o autor...',
      allCategories: 'Todas las categorías',
      searchButton: 'Buscar',
      loading: 'Cargando...',
      noResults: 'No se encontraron libros. Intenta una búsqueda diferente.',
      downloads: 'Descargas',
      addedBy: 'Agregado por',
      downloadLinks: 'Enlaces de descarga',
      downloadFile: 'Descargar archivo',
      
      // Add Book
      shareBookTitle: 'Compartir libro',
      bookTitle: 'Título',
      author: 'Autor',
      description: 'Descripción',
      category: 'Categoría',
      selectCategory: 'Selecciona una categoría',
      downloadLinksSection: 'Enlaces de descarga',
      urlPlaceholder: 'URL de descarga',
      formatPlaceholder: 'Formato (PDF, EPUB, etc.)',
      addLink: 'Agregar enlace',
      removeLink: 'Eliminar',
      orSendFile: 'O enviar archivo',
      shareBookButton: 'Compartir libro',
      sending: 'Enviando...',
      
      // Categories
      fiction: 'Ficción',
      romance: 'Romance',
      mystery: 'Misterio',
      fantasy: 'Fantasía',
      biography: 'Biografía',
      history: 'Historia',
      science: 'Ciencia',
      technology: 'Tecnología',
      selfHelp: 'Autoayuda',
      education: 'Educación',
      
      // Theme
      darkMode: 'Modo oscuro',
      lightMode: 'Modo claro',
      
      // Language
      language: 'Idioma',
      
      // Navigation
      goBack: 'Volver',
      
      // Modal
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      emailNotFound: 'Email no encontrado',
      emailNotFoundMessage: 'El email proporcionado no existe en nuestra plataforma. ¿Te gustaría crear una cuenta?',
      createAccountModal: 'Crear cuenta',
      emailSent: '¡Email enviado!',
      emailSentMessage: 'Si este email está registrado, recibirás instrucciones para restablecer tu contraseña.',
      
      // Admin
      adminDashboard: 'Panel de administración',
      overview: 'Resumen',
      manageBooks: 'Gestionar libros',
      users: 'Usuarios',
      totalUsers: 'Total de usuarios',
      totalBooks: 'Total de libros',
      pendingBooks: 'Libros pendientes',
      totalDownloads: 'Total de descargas',
      approve: 'Aprobar',
      reject: 'Rechazar',
      delete: 'Eliminar',
      approved: 'Aprobado',
      rejected: 'Rechazado',
      pending: 'Pendiente',
      
      // Dashboard
      dashboard: 'Panel de control',
      myLibrary: 'Mi biblioteca',
      welcomeBackDashboard: 'Bienvenido de vuelta',
      exploreLibrary: 'Explora nuestra biblioteca digital y comparte conocimiento',
      exploreBooks: 'Explorar libros',
      shareBookAction: 'Compartir libro',
      booksAvailable: 'Libros disponibles',
      booksShared: 'Libros compartidos',
      downloadsCompleted: 'Descargas completadas',
      accountStatus: 'Estado de la cuenta',
      active: 'Activo',
      recentActivity: 'Actividad reciente',
      quickActions: 'Acciones rápidas',
      searchByCategory: 'Buscar por categoría',
      newBook: 'Nuevo libro',
      myBooks: 'Mis libros',
      favorites: 'Favoritos',
      
      // User roles
      supremeAdmin: 'Administrador supremo',
      administrator: 'Administrador',
      moderator: 'Moderador',
      vip2: 'VIP 2',
      vip1: 'VIP 1',
      user: 'Usuario',
      
      // Navigation
      explore: 'Explorar',
      share: 'Compartir',
      library: 'Biblioteca',
      
      // Page subtitles
      dashboardOverview: 'Resumen de tu biblioteca',
      findAmazingBooks: 'Encuentra libros increíbles',
      shareKnowledge: 'Comparte conocimiento',
      yourFavoriteBooks: 'Tus libros favoritos',
      
      // Profile menu
      myProfile: 'Mi perfil',
      myLibraryMenu: 'Mi biblioteca',
      favoritesMenu: 'Favoritos',
      downloadsMenu: 'Descargas',
      settings: 'Configuración',
      adminPanelMenu: 'Panel de administración',
      logout: 'Cerrar sesión',
      
      // Activity
      download: 'Descarga',
      shared: 'Compartió',
      hoursAgo: 'horas atrás',
      dayAgo: 'día atrás',
      daysAgo: 'días atrás',
      
      // Notifications
      notifications: 'Notificaciones',
      noNotifications: 'Sin notificaciones',
      markAllAsRead: 'Marcar todas como leídas',
      refresh: 'Actualizar',
      loadingNotifications: 'Cargando...',
      now: 'Ahora',
      minutesAgo: 'min atrás',
      hoursAgoShort: 'h atrás',
      daysAgoShort: 'd atrás',
      by: 'Por',
      toastActivated: 'Toast Activado',
      toastActivatedMessage: '¡Las notificaciones toast están ahora habilitadas!',
      testToast: 'Prueba de Toast',
      testToastMessage: '¡Esta es una notificación de prueba!',
      debugForced: 'DEBUG FORZADO',
      debugForcedMessage: 'Toast forzado para debug - ¡debería aparecer!',
      testSound: 'Probar sonido',
      testToastButton: 'Probar toast',
      debugForcedButton: 'Debug forzado',
      enableToast: 'Activar toast',
      disableToast: 'Desactivar toast',
      enableSound: 'Activar sonido',
      disableSound: 'Desactivar sonido',
      toast: 'Toast',
      sound: 'Sonido'
    }
  }
};

const detectBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.toLowerCase();
  
  // Mapear códigos de idioma do navegador para nossos códigos
  if (langCode.startsWith('pt')) return 'pt-br';
  if (langCode.startsWith('en')) return 'en';
  if (langCode.startsWith('es')) return 'es';
  if (langCode.startsWith('ru')) return 'ru';
  
  // Fallback para português
  return 'pt-br';
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    return savedLanguage || detectBrowserLanguage();
  });

  useEffect(() => {
    localStorage.setItem('selectedLanguage', currentLanguage);
  }, [currentLanguage]);

  const changeLanguage = (languageCode) => {
    setCurrentLanguage(languageCode);
  };

  const t = (key) => {
    // Tentar buscar no idioma atual
    const currentTranslation = languages[currentLanguage]?.translations[key];
    if (currentTranslation) return currentTranslation;
    
    // Fallback para português
    const fallbackTranslation = languages['pt-br']?.translations[key];
    if (fallbackTranslation) return fallbackTranslation;
    
    // Se não encontrar, retornar a chave
    return key;
  };

  const getCurrentLanguage = () => {
    return languages[currentLanguage];
  };

  const getAvailableLanguages = () => {
    return Object.values(languages);
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    getCurrentLanguage,
    getAvailableLanguages
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};