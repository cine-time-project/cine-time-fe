// src/config.js
export const config = {
  project: {
    name: "CineTime",
    slogan: "Sinema keyfi bir tık uzağında",
    description:
      "CineTime; vizyondaki filmler, seanslar ve bilet satın alma deneyimini hızlı ve güvenli şekilde sunar.",
  },

  features: {
    whatsapp: true,
    liveChat: false,
  },

  i18n: {
    timeZone: "Europe/Berlin",
  },

  contact: {
    info: {
      phone: {
        value: "+90 (212) 000 00 00",
        icon: "pi pi-phone",
        link: "tel:+902120000000",
      },
      email: {
        value: "destek@cinetime.example",
        icon: "pi pi-envelope",
        link: "mailto:destek@cinetime.example",
      },
      address: {
        value: "Büyükdere Cd. No:181, Şişli/İstanbul",
        icon: "pi pi-map-marker",
        link: "https://maps.app.goo.gl/xxxxxxxx",
      },
    },
    website: "https://cinetime.example",
    map: {
      embed:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6019.0206!2d29.006!3d41.080!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0!2s%C5%9Ei%C5%9Fli!5e0!3m2!1str!2str!4v1700000000000",
    },
    socialMedia: {
      twitter: { url: "https://x.com/cinetime", icon: "pi pi-twitter" },
      facebook: { url: "https://facebook.com/cinetime", icon: "pi pi-facebook" },
      instagram: { url: "https://instagram.com/cinetime", icon: "pi pi-instagram" },
      youtube: { url: "https://youtube.com/@cinetime", icon: "pi pi-youtube" },
      linkedin: { url: "https://linkedin.com/company/cinetime", icon: "pi pi-linkedin" },
    },
    whatsapp: {
      number: "+905555555555",
      defaultText: "Merhaba, destek için yazıyorum.",
      showHoursNote: true,
      hoursTextKey: "contact.hours",
    },
  },

  // API kökü
  apiURL:
    (process.env.NEXT_PUBLIC_API_BASE ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:8100/api").replace(/\/$/, ""),

  locales: ["tr", "en", "de", "fr"],
  defaultLocale: "tr",

  // Bilet/ürün sabitleri
  ticketTypes: [
    { labelKey: "tickets.adult", value: "ADULT" },
    { labelKey: "tickets.student", value: "STUDENT" },
    { labelKey: "tickets.child", value: "CHILD" },
  ],
  seatCategories: [
    { labelKey: "seats.standard", value: "STANDARD" },
    { labelKey: "seats.vip", value: "VIP" },
    { labelKey: "seats.couple", value: "COUPLE" },
  ],
  paymentProviders: [
    { value: "CREDIT_CARD", labelKey: "payment.creditCard", icon: "pi pi-credit-card" },
    { value: "WALLET", labelKey: "payment.wallet", icon: "pi pi-wallet" },
  ],

  days: [
    { value: "MONDAY", labelKey: "days.mon" },
    { value: "TUESDAY", labelKey: "days.tue" },
    { value: "WEDNESDAY", labelKey: "days.wed" },
    { value: "THURSDAY", labelKey: "days.thu" },
    { value: "FRIDAY", labelKey: "days.fri" },
    { value: "SATURDAY", labelKey: "days.sat" },
    { value: "SUNDAY", labelKey: "days.sun" },
  ],

  cities: ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"],

  NEXT_PUBLIC_GOOGLE_CLIENT_ID:
    "217090357245-psqauf47tu2tic2c0d3hlal7llvdc3nt.apps.googleusercontent.com",

  // =========================
  // ROLE-BASED ROUTE MATRIX
  // DB roles: ANONYMOUS, MEMBER, EMPLOYEE, ADMIN
  // =========================
userRightsOnRoutes: [
  // =========================
  // ADMIN PANEL (giriş)
  // =========================
  { urlRegex: /^\/(tr|en|de|fr)\/admin\/dashboard$/, roles: ["ADMIN", "EMPLOYEE"] },

  // =========================
  // USERS — BE: ADMIN | EMPLOYEE (U08, U09, U10, U11)
  // =========================
  // Liste / arama
  { urlRegex: /^\/(tr|en|de|fr)\/admin\/users$/, roles: ["ADMIN", "EMPLOYEE"] },
  // Yeni kullanıcı ekranı (BE'de create endpoint'i authenticated; admin panelden açıyorsan ADMIN|EMPLOYEE makul)
  { urlRegex: /^\/(tr|en|de|fr)\/admin\/users\/new$/, roles: ["ADMIN", "EMPLOYEE"] },
  // Detay/Düzenleme (U10 update, U11 delete -> ADMIN|EMPLOYEE)
  { urlRegex: /^\/(tr|en|de|fr)\/admin\/users\/([0-9]+|[a-z0-9-]+)(\/edit)?$/, roles: ["ADMIN", "EMPLOYEE"] },

  // =========================
  // Liste: ADMIN|EMPLOYEE; new/edit: sadece ADMIN
  // =========================
// Movies (Admin panel)
{ urlRegex: /^\/(tr|en|de|fr)\/admin\/movies$/, roles: ["ADMIN","EMPLOYEE"] }, // Liste
{ urlRegex: /^\/(tr|en|de|fr)\/admin\/movies\/new$/, roles: ["ADMIN"] },            // Yeni
{ urlRegex: /^\/(tr|en|de|fr)\/admin\/movies\/(?:\d+|[a-z0-9-]+)(?:\/edit)?$/, roles: ["ADMIN"] },            // Detay/Düzenle



  // =========================
  // CINEMAS / HALLS / SHOWTIMES / IMAGES vb. — (önceki matrisinle uyumlu)
  // İstersen aynen koru:
  // =========================
  { urlRegex: /^\/(tr|en|de|fr)\/admin\/cinemas$/, roles: ["ADMIN"] },
  { urlRegex: /^\/(tr|en|de|fr)\/admin\/cinemas\/new$/, roles: ["ADMIN"] },
  { urlRegex: /^\/(tr|en|de|fr)\/admin\/cinemas\/([0-9]+|[a-z0-9-]+)$/, roles: ["ADMIN"] },
  { urlRegex: /^\/(tr|en|de|fr)\/admin\/cinemas\/([0-9]+|[a-z0-9-]+)\/halls$/, roles: ["ADMIN"] },

  { urlRegex: /^\/(tr|en|de|fr)\/admin\/halls$/, roles: ["ADMIN"] },
  { urlRegex: /^\/(tr|en|de|fr)\/admin\/halls\/new$/, roles: ["ADMIN"] },
  { urlRegex: /^\/(tr|en|de|fr)\/admin\/halls\/([0-9]+|[a-z0-9-]+)$/, roles: ["ADMIN"] },

  { urlRegex: /^\/(tr|en|de|fr)\/admin\/showtimes$/, roles: ["ADMIN"] },
  { urlRegex: /^\/(tr|en|de|fr)\/admin\/showtimes\/new$/, roles: ["ADMIN"] },
  { urlRegex: /^\/(tr|en|de|fr)\/admin\/showtimes\/([0-9]+|[a-z0-9-]+)$/, roles: ["ADMIN"] },

  { urlRegex: /^\/(tr|en|de|fr)\/admin\/images$/, roles: ["ADMIN"] },
  { urlRegex: /^\/(tr|en|de|fr)\/admin\/images\/([0-9]+|[a-z0-9-]+)$/, roles: ["ADMIN"] },

  { urlRegex: /^\/(tr|en|de|fr)\/admin\/cinema-images$/, roles: ["ADMIN"] },
  { urlRegex: /^\/(tr|en|de|fr)\/admin\/cinema-images\/([0-9]+)$/, roles: ["ADMIN"] },

  // İzleme/okuma ağırlıklı panel sayfaları
  { urlRegex: /^\/(tr|en|de|fr)\/admin\/cities$/, roles: ["ADMIN", "EMPLOYEE"] },
  { urlRegex: /^\/(tr|en|de|fr)\/admin\/special-halls$/, roles: ["ADMIN", "EMPLOYEE"] },
  { urlRegex: /^\/(tr|en|de|fr)\/admin\/contact-messages$/, roles: ["ADMIN", "EMPLOYEE"] },
  { urlRegex: /^\/(tr|en|de|fr)\/admin\/tickets(\/.*)?$/, roles: ["ADMIN", "EMPLOYEE"] },
  { urlRegex: /^\/(tr|en|de|fr)\/admin\/reports$/, roles: ["ADMIN", "EMPLOYEE"] },

  // =========================
  // AUTH GEREKTİREN “KENDİ HESABI” SAYFALARI — BE: isAuthenticated
  // U06 / U07 / U01 / Reset Password gibi akışlar buradan çalışır
  // =========================
  { urlRegex: /^\/(tr|en|de|fr)\/account$/, roles: ["MEMBER", "EMPLOYEE", "ADMIN"] },
  { urlRegex: /^\/(tr|en|de|fr)\/account\/tickets$/, roles: ["MEMBER", "EMPLOYEE", "ADMIN"] },
  { urlRegex: /^\/(tr|en|de|fr)\/account\/tickets\/([0-9]+|[a-z0-9-]+)$/, roles: ["MEMBER", "EMPLOYEE", "ADMIN"] },
  { urlRegex: /^\/(tr|en|de|fr)\/favorites$/, roles: ["MEMBER", "EMPLOYEE", "ADMIN"] },
  { urlRegex: /^\/(tr|en|de|fr)\/checkout$/, roles: ["MEMBER", "EMPLOYEE", "ADMIN"] },
  { urlRegex: /^\/(tr|en|de|fr)\/payment$/, roles: ["MEMBER", "EMPLOYEE", "ADMIN"] },

  // Public dashboard’ı sadece yönetim menüsü amaçlı kullanıyorsan:
  { urlRegex: /^\/(tr|en|de|fr)\/dashboard$/, roles: ["ADMIN", "EMPLOYEE"] },
],

};
