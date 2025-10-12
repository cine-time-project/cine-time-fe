// src/config.js
export const config = {
  project: {
    name: "CineTime",
    slogan: "Sinema keyfi bir tık uzağında",
    description:
      "CineTime; vizyondaki filmler, seanslar ve bilet satın alma deneyimini hızlı ve güvenli şekilde sunar.",
  },

  // ---- Özellik bayrakları (eğitim modunda servisleri kapatmak için) ----
  features: {
    whatsapp: true,   // eğitim: kapalı (true yapınca buton/bağlantı görünür)
    liveChat: false,   // Crisp/Tidio gibi script’leri eğitimde kapatalım
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
      // İstanbul merkez embed (örnek). Kendi konumunu eklersen değiştir.
      embed:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6019.0206!2d29.006!3d41.080!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0!2s%C5%9Ei%C5%9Fli!5e0!3m2!1str!2str!4v1700000000000",
    },
    socialMedia: {
      twitter:  { url: "https://x.com/cinetime",        icon: "pi pi-twitter"   },
      facebook: { url: "https://facebook.com/cinetime", icon: "pi pi-facebook"  },
      instagram:{ url: "https://instagram.com/cinetime",icon: "pi pi-instagram" },
      youtube:  { url: "https://youtube.com/@cinetime", icon: "pi pi-youtube"   },
      linkedin: { url: "https://linkedin.com/company/cinetime", icon: "pi pi-linkedin" },
    },

    // ---- WhatsApp ayarları (tek numara, Business’a geçince hazır) ----
    whatsapp: {
      number: "+905555555555",                 // E.164 format; gerçek numaran yoksa boş bırak
      defaultText: "Merhaba, destek için yazıyorum.",
      showHoursNote: true,                     // saat notu göstermek istersen
      hoursTextKey: "contact.hours"            // i18n anahtarı
    },
  },

  // ---- API kökü: env > config fallback (tek yerden kontrol) ----
  // Not: api-routes.js bu değeri import edip tüm endpoint’leri oradan kurmalı.
  apiURL: (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8100/api").replace(/\/$/, ""),

  // Desteklenen diller
  locales: ["tr", "en", "de", "fr"],
  defaultLocale: "tr",

  // Bilet/ürünle ilgili sabitler
  ticketTypes: [
    { labelKey: "tickets.adult",   value: "ADULT"   },
    { labelKey: "tickets.student", value: "STUDENT" },
    { labelKey: "tickets.child",   value: "CHILD"   },
  ],
  seatCategories: [
    { labelKey: "seats.standard", value: "STANDARD" },
    { labelKey: "seats.vip",      value: "VIP"      },
    { labelKey: "seats.couple",   value: "COUPLE"   },
  ],
  paymentProviders: [
    { value: "CREDIT_CARD", labelKey: "payment.creditCard", icon: "pi pi-credit-card" },
    { value: "WALLET",      labelKey: "payment.wallet",     icon: "pi pi-wallet"      },
  ],

  // Seans/planlama için günler
  days: [
    { value: "MONDAY",    labelKey: "days.mon" },
    { value: "TUESDAY",   labelKey: "days.tue" },
    { value: "WEDNESDAY", labelKey: "days.wed" },
    { value: "THURSDAY",  labelKey: "days.thu" },
    { value: "FRIDAY",    labelKey: "days.fri" },
    { value: "SATURDAY",  labelKey: "days.sat" },
    { value: "SUNDAY",    labelKey: "days.sun" },
  ],

  // Örnek şehir/şube listesi (UI filtreleri için)
  cities: ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"],
};
