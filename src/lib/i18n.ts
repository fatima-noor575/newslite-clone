export type Lang = "en" | "ur" | "pa";

const dict: Record<Lang, Record<string, string>> = {
  en: {
    dashboard: "Dashboard", farms: "Farms", crops: "Crops", scanner: "Disease Scanner",
    irrigation: "Irrigation", fertilizer: "Fertilizer", weather: "Weather",
    yield: "Yield Prediction", profit: "Profit Calculator", reports: "Reports",
    chat: "AI Assistant", notifications: "Notifications", settings: "Settings",
    signOut: "Sign out",
  },
  ur: {
    dashboard: "ڈیش بورڈ", farms: "کھیت", crops: "فصلیں", scanner: "بیماری اسکینر",
    irrigation: "آبپاشی", fertilizer: "کھاد", weather: "موسم",
    yield: "پیداوار کی پیش گوئی", profit: "منافع کیلکولیٹر", reports: "رپورٹس",
    chat: "AI معاون", notifications: "اطلاعات", settings: "ترتیبات",
    signOut: "سائن آؤٹ",
  },
  pa: {
    dashboard: "ਡੈਸ਼ਬੋਰਡ", farms: "ਖੇਤ", crops: "ਫਸਲਾਂ", scanner: "ਰੋਗ ਸਕੈਨਰ",
    irrigation: "ਸਿੰਚਾਈ", fertilizer: "ਖਾਦ", weather: "ਮੌਸਮ",
    yield: "ਪੈਦਾਵਾਰ ਭਵਿੱਖਬਾਣੀ", profit: "ਲਾਭ ਕੈਲਕੁਲੇਟਰ", reports: "ਰਿਪੋਰਟਾਂ",
    chat: "AI ਸਹਾਇਕ", notifications: "ਸੂਚਨਾਵਾਂ", settings: "ਸੈਟਿੰਗਾਂ",
    signOut: "ਸਾਈਨ ਆਊਟ",
  },
};

let current: Lang = (localStorage.getItem("agro_lang") as Lang) || "en";
const listeners = new Set<() => void>();

export const getLang = () => current;
export const setLang = (l: Lang) => { current = l; localStorage.setItem("agro_lang", l); listeners.forEach(f => f()); };
export const onLangChange = (fn: () => void) => { listeners.add(fn); return () => listeners.delete(fn); };
export const t = (k: string) => dict[current]?.[k] ?? dict.en[k] ?? k;
