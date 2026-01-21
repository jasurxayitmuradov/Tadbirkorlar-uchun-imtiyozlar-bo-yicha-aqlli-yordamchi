import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Tarjimalar
const resources = {
  uz: {
    translation: {
      // Umumiy
      'app.name': 'Benefit Navigator',
      'app.subtitle': 'O\'zbekistonda biznes uchun qo\'llanma',
      
      // Login
      'login.title': 'Kirish',
      'login.subtitle': 'Hisobingizga kiring',
      'login.method.login': 'Login/Parol',
      'login.method.phone': 'Telefon',
      'login.username': 'Login',
      'login.password': 'Parol',
      'login.phone': 'Telefon raqami',
      'login.phone.placeholder': '+998901234567',
      'login.submit': 'Kirish',
      'login.register.link': 'Ro\'yxatdan o\'tmadingizmi?',
      'login.register': 'Ro\'yxatdan o\'tish',
      'login.error.invalid': 'Login yoki parol noto\'g\'ri',
      'login.error.phone': 'Telefon raqam topilmadi',
      
      // Register
      'register.title': 'Ro\'yxatdan o\'tish',
      'register.subtitle': 'Yangi hisob yarating',
      'register.firstName': 'Ism',
      'register.lastName': 'Familiya',
      'register.username': 'Login',
      'register.password': 'Parol',
      'register.password.min': 'Kamida 6 belgi',
      'register.phone': 'Telefon raqami',
      'register.region': 'Hudud',
      'register.submit': 'Ro\'yxatdan o\'tish',
      'register.login.link': 'Hisobingiz bormi?',
      'register.login': 'Kirish',
      'register.error.username.exists': 'Bu login allaqachon mavjud',
      'register.error.phone.exists': 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan',
      'register.error.password.short': 'Parol kamida 6 belgi bo\'lishi kerak',
      
      // SMS Verification
      'sms.title': 'SMS kodni tasdiqlash',
      'sms.subtitle': 'Telefon raqamingizga yuborilgan kodni kiriting',
      'sms.code': 'SMS kod',
      'sms.code.placeholder': '123456',
      'sms.verify': 'Tasdiqlash',
      'sms.resend': 'Kodni qayta yuborish',
      'sms.error.invalid': 'Kod noto\'g\'ri',
      'sms.sent': 'Kod yuborildi',
      
      // Sidebar
      'sidebar.dashboard': 'Dashboard',
      'sidebar.news': 'Yangiliklar',
      'sidebar.chat': 'AI Yordamchi',
      'sidebar.benefits': 'Imtiyozlar',
      'sidebar.courses': 'Kurslar',
      'sidebar.sources': 'Manbalar',
      'sidebar.settings': 'Sozlamalar',
      'sidebar.language': 'Til',
      'sidebar.language.uz': 'O\'Z',
      'sidebar.language.ru': 'RU',
      'sidebar.language.en': 'EN',
      
      // Dashboard
      'dashboard.welcome': 'Assalomu alaykum',
      'dashboard.region': 'Hudud',
      'dashboard.active.benefits': 'Faol imtiyozlar',
      'dashboard.new.courses': 'Yangi kurslar',
      'dashboard.ask.ai': 'AI Yordamchidan so\'rang',
      'dashboard.latest.news': 'So\'nggi rasmiy yangiliklar',
      'dashboard.recommended': 'Sizga tavsiya etiladi',
      'dashboard.view.all': 'Barchasini ko\'rish',
      'dashboard.browse': 'Ko\'rib chiqish',
      
      // Settings
      'settings.title': 'Sozlamalar',
      'settings.reset': 'Ma\'lumotlarni tozalash (Chiqish)',
    }
  },
  ru: {
    translation: {
      // Umumiy
      'app.name': 'Benefit Navigator',
      'app.subtitle': 'Ваш гид по бизнесу в Узбекистане',
      
      // Login
      'login.title': 'Вход',
      'login.subtitle': 'Войдите в свой аккаунт',
      'login.method.login': 'Логин/Пароль',
      'login.method.phone': 'Телефон',
      'login.username': 'Логин',
      'login.password': 'Пароль',
      'login.phone': 'Номер телефона',
      'login.phone.placeholder': '+998901234567',
      'login.submit': 'Войти',
      'login.register.link': 'Еще не зарегистрированы?',
      'login.register': 'Регистрация',
      'login.error.invalid': 'Неверный логин или пароль',
      'login.error.phone': 'Телефон не найден',
      
      // Register
      'register.title': 'Регистрация',
      'register.subtitle': 'Создайте новый аккаунт',
      'register.firstName': 'Имя',
      'register.lastName': 'Фамилия',
      'register.username': 'Логин',
      'register.password': 'Пароль',
      'register.password.min': 'Минимум 6 символов',
      'register.phone': 'Номер телефона',
      'register.region': 'Регион',
      'register.submit': 'Зарегистрироваться',
      'register.login.link': 'Уже есть аккаунт?',
      'register.login': 'Войти',
      'register.error.username.exists': 'Этот логин уже существует',
      'register.error.phone.exists': 'Этот номер телефона уже зарегистрирован',
      'register.error.password.short': 'Пароль должен быть не менее 6 символов',
      
      // SMS Verification
      'sms.title': 'Подтверждение SMS кода',
      'sms.subtitle': 'Введите код, отправленный на ваш номер телефона',
      'sms.code': 'SMS код',
      'sms.code.placeholder': '123456',
      'sms.verify': 'Подтвердить',
      'sms.resend': 'Отправить код повторно',
      'sms.error.invalid': 'Неверный код',
      'sms.sent': 'Код отправлен',
      
      // Sidebar
      'sidebar.dashboard': 'Панель управления',
      'sidebar.news': 'Новости',
      'sidebar.chat': 'AI Помощник',
      'sidebar.benefits': 'Льготы',
      'sidebar.courses': 'Курсы',
      'sidebar.sources': 'Источники',
      'sidebar.settings': 'Настройки',
      'sidebar.language': 'Язык',
      'sidebar.language.uz': 'УЗ',
      'sidebar.language.ru': 'РУ',
      'sidebar.language.en': 'АН',
      
      // Dashboard
      'dashboard.welcome': 'Здравствуйте',
      'dashboard.region': 'Регион',
      'dashboard.active.benefits': 'Активные льготы',
      'dashboard.new.courses': 'Новые курсы',
      'dashboard.ask.ai': 'Спросите AI помощника',
      'dashboard.latest.news': 'Последние официальные новости',
      'dashboard.recommended': 'Рекомендуется для вас',
      'dashboard.view.all': 'Посмотреть все',
      'dashboard.browse': 'Просмотр',
      
      // Settings
      'settings.title': 'Настройки',
      'settings.reset': 'Очистить данные (Выход)',
    }
  },
  en: {
    translation: {
      // Umumiy
      'app.name': 'Benefit Navigator',
      'app.subtitle': 'Your guide to business in Uzbekistan',
      
      // Login
      'login.title': 'Login',
      'login.subtitle': 'Sign in to your account',
      'login.method.login': 'Login/Password',
      'login.method.phone': 'Phone',
      'login.username': 'Username',
      'login.password': 'Password',
      'login.phone': 'Phone number',
      'login.phone.placeholder': '+998901234567',
      'login.submit': 'Sign in',
      'login.register.link': 'Not registered yet?',
      'login.register': 'Register',
      'login.error.invalid': 'Invalid username or password',
      'login.error.phone': 'Phone number not found',
      
      // Register
      'register.title': 'Register',
      'register.subtitle': 'Create a new account',
      'register.firstName': 'First name',
      'register.lastName': 'Last name',
      'register.username': 'Username',
      'register.password': 'Password',
      'register.password.min': 'Minimum 6 characters',
      'register.phone': 'Phone number',
      'register.region': 'Region',
      'register.submit': 'Register',
      'register.login.link': 'Already have an account?',
      'register.login': 'Sign in',
      'register.error.username.exists': 'This username already exists',
      'register.error.phone.exists': 'This phone number is already registered',
      'register.error.password.short': 'Password must be at least 6 characters',
      
      // SMS Verification
      'sms.title': 'SMS Code Verification',
      'sms.subtitle': 'Enter the code sent to your phone number',
      'sms.code': 'SMS code',
      'sms.code.placeholder': '123456',
      'sms.verify': 'Verify',
      'sms.resend': 'Resend code',
      'sms.error.invalid': 'Invalid code',
      'sms.sent': 'Code sent',
      
      // Sidebar
      'sidebar.dashboard': 'Dashboard',
      'sidebar.news': 'News',
      'sidebar.chat': 'AI Assistant',
      'sidebar.benefits': 'Benefits',
      'sidebar.courses': 'Courses',
      'sidebar.sources': 'Sources',
      'sidebar.settings': 'Settings',
      'sidebar.language': 'Language',
      'sidebar.language.uz': 'UZ',
      'sidebar.language.ru': 'RU',
      'sidebar.language.en': 'EN',
      
      // Dashboard
      'dashboard.welcome': 'Hello',
      'dashboard.region': 'Region',
      'dashboard.active.benefits': 'Active benefits',
      'dashboard.new.courses': 'New courses',
      'dashboard.ask.ai': 'Ask AI Assistant',
      'dashboard.latest.news': 'Latest official updates',
      'dashboard.recommended': 'Recommended for you',
      'dashboard.view.all': 'View all',
      'dashboard.browse': 'Browse',
      
      // Settings
      'settings.title': 'Settings',
      'settings.reset': 'Reset App Data (Log out)',
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'uz', // Default til o'zbekcha
    fallbackLng: 'uz',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      // Agar localStorage da til bo'lmasa, o'zbekcha qo'yadi
      checkWhitelist: true,
    },
  });

// Agar localStorage da til bo'lmasa, o'zbekcha qo'yish
if (!localStorage.getItem('i18nextLng')) {
  i18n.changeLanguage('uz');
  localStorage.setItem('i18nextLng', 'uz');
}

export default i18n;
