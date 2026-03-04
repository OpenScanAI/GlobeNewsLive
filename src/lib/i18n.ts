// Multi-language support for Global Intel Dashboard

export type Language = 'en' | 'ar' | 'he' | 'fa' | 'zh' | 'ru' | 'es' | 'fr' | 'de';

export const LANGUAGES: { code: Language; name: string; native: string; rtl?: boolean }[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ar', name: 'Arabic', native: 'العربية', rtl: true },
  { code: 'he', name: 'Hebrew', native: 'עברית', rtl: true },
  { code: 'fa', name: 'Persian', native: 'فارسی', rtl: true },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
];

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'header.title': 'GLOBENEWS LIVE',
    'header.subtitle': 'Real-time intelligence monitoring',
    'header.live': 'LIVE',
    'header.settings': 'Settings',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.warroom': 'War Room',
    'nav.signals': 'Signals',
    'nav.map': 'Map',
    'nav.markets': 'Markets',
    'nav.flights': 'Flights',
    'nav.ships': 'Ships',
    'nav.cyber': 'Cyber',
    'nav.alerts': 'Alerts',
    
    // Signal Feed
    'signals.title': 'SIGNAL FEED',
    'signals.breaking': 'BREAKING',
    'signals.critical': 'CRITICAL',
    'signals.high': 'HIGH',
    'signals.medium': 'MEDIUM',
    'signals.low': 'LOW',
    'signals.filter.all': 'ALL',
    'signals.filter.iran': 'IRAN',
    'signals.sources': 'sources',
    
    // Map
    'map.title': 'WORLD MAP',
    'map.layers': 'LAYERS',
    'map.conflicts': 'Conflicts',
    'map.routes': 'Trade Routes',
    'map.military': 'Military Bases',
    'map.nuclear': 'Nuclear Sites',
    'map.chokepoints': 'Chokepoints',
    'map.earthquakes': 'Earthquakes',
    'map.cyber': 'Cyber Threats',
    
    // Cyber
    'cyber.title': 'CYBER THREATS',
    'cyber.critical': 'CRITICAL',
    'cyber.ongoing': 'ongoing',
    'cyber.apt': 'APT',
    'cyber.ransomware': 'RANSOMWARE',
    'cyber.ddos': 'DDOS',
    'cyber.breach': 'DATA BREACH',
    
    // Flight Radar
    'flights.title': 'FLIGHT RADAR',
    'flights.military': 'MILITARY',
    'flights.isr': 'ISR',
    'flights.emergency': 'EMERGENCY',
    'flights.region': 'Region',
    
    // Ship Tracking
    'ships.title': 'SHIP TRACKING',
    'ships.tankers': 'Tankers',
    'ships.cargo': 'Cargo',
    'ships.military': 'Military',
    
    // Predictions
    'predictions.title': 'PREDICTIONS',
    'predictions.probability': 'Probability',
    
    // Alerts
    'alerts.title': 'ALERTS',
    'alerts.configure': 'Configure',
    'alerts.telegram': 'Telegram',
    'alerts.webhook': 'Webhook',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error loading data',
    'common.refresh': 'Refresh',
    'common.close': 'Close',
    'common.search': 'Search...',
    'common.ago': 'ago',
    'common.active': 'ACTIVE',
    'common.offline': 'OFFLINE',
  },
  
  ar: {
    'header.title': 'المخابرات العالمية',
    'header.subtitle': 'مراقبة استخباراتية في الوقت الفعلي',
    'header.live': 'مباشر',
    'nav.dashboard': 'لوحة التحكم',
    'nav.warroom': 'غرفة الحرب',
    'nav.signals': 'الإشارات',
    'nav.map': 'الخريطة',
    'signals.title': 'تغذية الإشارات',
    'signals.breaking': 'عاجل',
    'signals.critical': 'حرج',
    'map.title': 'خريطة العالم',
    'map.conflicts': 'النزاعات',
    'map.nuclear': 'المواقع النووية',
    'cyber.title': 'التهديدات السيبرانية',
    'flights.title': 'رادار الطيران',
    'ships.title': 'تتبع السفن',
    'common.loading': 'جاري التحميل...',
    'common.search': 'بحث...',
  },
  
  he: {
    'header.title': 'מודיעין גלובלי',
    'header.subtitle': 'ניטור מודיעין בזמן אמת',
    'header.live': 'שידור חי',
    'nav.dashboard': 'לוח בקרה',
    'nav.warroom': 'חדר מלחמה',
    'nav.signals': 'אותות',
    'nav.map': 'מפה',
    'signals.title': 'פיד אותות',
    'signals.breaking': 'מבזק',
    'signals.critical': 'קריטי',
    'map.title': 'מפת עולם',
    'map.conflicts': 'סכסוכים',
    'map.nuclear': 'אתרים גרעיניים',
    'cyber.title': 'איומי סייבר',
    'flights.title': 'רדאר טיסות',
    'common.loading': 'טוען...',
  },
  
  fa: {
    'header.title': 'اطلاعات جهانی',
    'header.subtitle': 'نظارت اطلاعاتی بلادرنگ',
    'header.live': 'زنده',
    'nav.dashboard': 'داشبورد',
    'nav.warroom': 'اتاق جنگ',
    'nav.signals': 'سیگنال‌ها',
    'nav.map': 'نقشه',
    'signals.title': 'فید سیگنال',
    'signals.breaking': 'فوری',
    'signals.critical': 'بحرانی',
    'map.title': 'نقشه جهان',
    'map.conflicts': 'درگیری‌ها',
    'map.nuclear': 'سایت‌های هسته‌ای',
    'cyber.title': 'تهدیدات سایبری',
    'flights.title': 'رادار پرواز',
    'common.loading': 'در حال بارگذاری...',
  },
  
  zh: {
    'header.title': '全球情报',
    'header.subtitle': '实时情报监控',
    'header.live': '直播',
    'nav.dashboard': '仪表板',
    'nav.warroom': '作战室',
    'nav.signals': '信号',
    'nav.map': '地图',
    'signals.title': '信号源',
    'signals.breaking': '突发',
    'signals.critical': '危急',
    'map.title': '世界地图',
    'map.conflicts': '冲突',
    'map.nuclear': '核设施',
    'cyber.title': '网络威胁',
    'flights.title': '航班雷达',
    'ships.title': '船舶追踪',
    'common.loading': '加载中...',
    'common.search': '搜索...',
  },
  
  ru: {
    'header.title': 'ГЛОБАЛЬНАЯ РАЗВЕДКА',
    'header.subtitle': 'Мониторинг разведданных в реальном времени',
    'header.live': 'ПРЯМОЙ ЭФИР',
    'nav.dashboard': 'Панель',
    'nav.warroom': 'Командный пункт',
    'nav.signals': 'Сигналы',
    'nav.map': 'Карта',
    'signals.title': 'ЛЕНТА СИГНАЛОВ',
    'signals.breaking': 'СРОЧНО',
    'signals.critical': 'КРИТИЧНО',
    'map.title': 'КАРТА МИРА',
    'map.conflicts': 'Конфликты',
    'map.nuclear': 'Ядерные объекты',
    'cyber.title': 'КИБЕРУГРОЗЫ',
    'flights.title': 'РАДАР ПОЛЁТОВ',
    'common.loading': 'Загрузка...',
    'common.search': 'Поиск...',
  },
  
  es: {
    'header.title': 'INTELIGENCIA GLOBAL',
    'header.subtitle': 'Monitoreo de inteligencia en tiempo real',
    'header.live': 'EN VIVO',
    'nav.dashboard': 'Panel',
    'nav.warroom': 'Sala de Guerra',
    'nav.signals': 'Señales',
    'nav.map': 'Mapa',
    'signals.title': 'FEED DE SEÑALES',
    'signals.breaking': 'URGENTE',
    'signals.critical': 'CRÍTICO',
    'map.title': 'MAPA MUNDIAL',
    'map.conflicts': 'Conflictos',
    'map.nuclear': 'Sitios Nucleares',
    'cyber.title': 'AMENAZAS CIBERNÉTICAS',
    'flights.title': 'RADAR DE VUELOS',
    'common.loading': 'Cargando...',
    'common.search': 'Buscar...',
  },
  
  fr: {
    'header.title': 'RENSEIGNEMENT MONDIAL',
    'header.subtitle': 'Surveillance en temps réel',
    'header.live': 'EN DIRECT',
    'nav.dashboard': 'Tableau de bord',
    'nav.warroom': 'Salle de guerre',
    'nav.signals': 'Signaux',
    'nav.map': 'Carte',
    'signals.title': 'FLUX DE SIGNAUX',
    'signals.breaking': 'URGENT',
    'signals.critical': 'CRITIQUE',
    'map.title': 'CARTE DU MONDE',
    'map.conflicts': 'Conflits',
    'map.nuclear': 'Sites nucléaires',
    'cyber.title': 'CYBERMENACES',
    'flights.title': 'RADAR AÉRIEN',
    'common.loading': 'Chargement...',
    'common.search': 'Rechercher...',
  },
  
  de: {
    'header.title': 'GLOBALE AUFKLÄRUNG',
    'header.subtitle': 'Echtzeit-Nachrichtenüberwachung',
    'header.live': 'LIVE',
    'nav.dashboard': 'Dashboard',
    'nav.warroom': 'Lagezentrum',
    'nav.signals': 'Signale',
    'nav.map': 'Karte',
    'signals.title': 'SIGNAL-FEED',
    'signals.breaking': 'EILMELDUNG',
    'signals.critical': 'KRITISCH',
    'map.title': 'WELTKARTE',
    'map.conflicts': 'Konflikte',
    'map.nuclear': 'Nuklearanlagen',
    'cyber.title': 'CYBERBEDROHUNGEN',
    'flights.title': 'FLUGRADAR',
    'common.loading': 'Laden...',
    'common.search': 'Suchen...',
  },
};

// Translation helper
export function t(key: string, lang: Language = 'en'): string {
  return translations[lang]?.[key] || translations.en[key] || key;
}

// Check if language is RTL
export function isRTL(lang: Language): boolean {
  return LANGUAGES.find(l => l.code === lang)?.rtl || false;
}

// Get browser language
export function getBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  const browserLang = navigator.language.split('-')[0];
  return LANGUAGES.some(l => l.code === browserLang) ? browserLang as Language : 'en';
}
