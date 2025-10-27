export const EXPERIENCES = {
  "imax": {
    variant: "hero",
    heroImage: "/images/experiences/imax-hero.jpg",
    titleKey: "imax.title",
    subtitleKey: "imax.subtitle",
    bodyKey: "imax.body",
    tiles: [
      { titleKey: "shared.crystalClear", descKey: "imax.tile1" },
      { titleKey: "shared.massiveScreen", descKey: "imax.tile2" },
      { titleKey: "shared.preciseSound", descKey: "imax.tile3" }
    ],
    // PrimeIcons
    features: [
      { pi: "pi-video",      textKey: "shared.laserProjection" },
      { pi: "pi-volume-up",  textKey: "shared.immersiveAudio" },
      { pi: "pi-star",       textKey: "shared.premiumSeats" }
    ],
    ctaKey: "shared.bookNow"
  },

  "4dx": {
    variant: "tiles",
    heroImage: "/images/experiences/4dx-hero.jpg",
    titleKey: "4dx.title",
    subtitleKey: "4dx.subtitle",
    bodyKey: "4dx.body",
    tiles: [
      { titleKey: "4dx.motion", descKey: "4dx.motionDesc" },
      { titleKey: "4dx.scent",  descKey: "4dx.scentDesc"  },
      { titleKey: "4dx.wind",   descKey: "4dx.windDesc"   },
      { titleKey: "4dx.rain",   descKey: "4dx.rainDesc"   }
    ],
    // PrimeIcons (yakın anlamlılar)
    features: [
      { pi: "pi-arrows-h",   textKey: "4dx.dynamicChairs" }, // hareket/ekseni simgeler
      { pi: "pi-cloud",      textKey: "4dx.environmentFX" }  // rüzgâr/yağmur/koku genel
    ],
    ctaKey: "shared.bookNow"
  },

  "dolby-atmos": {
    variant: "hero",
    heroImage: "/images/experiences/atmos-hero.webp",
    titleKey: "atmos.title",
    subtitleKey: "atmos.subtitle",
    bodyKey: "atmos.body",
    tiles: [
      { titleKey: "atmos.objectAudio",     descKey: "atmos.objectAudioDesc" },
      { titleKey: "atmos.ceilingSpeakers", descKey: "atmos.ceilingDesc" }
    ],
    // PrimeIcons
    features: [
      { pi: "pi-sliders-h",  textKey: "atmos.precision" },  // hassas ayar
      { pi: "pi-compass",    textKey: "atmos.placement" }   // konumlandırma
    ],
    ctaKey: "shared.bookNow"
  },

  "vip": {
    variant: "tiles",
    heroImage: "/images/experiences/vip-hero.avif",
    titleKey: "vip.title",
    subtitleKey: "vip.subtitle",
    bodyKey: "vip.body",
    tiles: [
      { titleKey: "vip.recliners", descKey: "vip.reclinersDesc" },
      { titleKey: "vip.lounge",    descKey: "vip.loungeDesc"    },
      { titleKey: "vip.service",   descKey: "vip.serviceDesc"   },
      { titleKey: "vip.priorityEntry",   descKey: "vip.priorityEntryDesc"   }
    ],
    // PrimeIcons
    features: [
      { pi: "pi-check-circle", textKey: "vip.welcomeDrink" },
      { pi: "pi-thumbs-up",    textKey: "vip.extraComfort" }
    ],
    ctaKey: "shared.reserve"
  },

  "family-lounge": {
    variant: "hero",
    heroImage: "/images/experiences/family-hero.webp",
    titleKey: "family.title",
    subtitleKey: "family.subtitle",
    bodyKey: "family.body",
    tiles: [
      { titleKey: "family.kidsArea", descKey: "family.kidsAreaDesc" },
      { titleKey: "family.babyCare", descKey: "family.babyCareDesc" }
    ],
    // PrimeIcons
    features: [
      { pi: "pi-gift",     textKey: "family.toys" },
      { pi: "pi-heart",    textKey: "family.babyFriendly" }
    ],
    ctaKey: "shared.bookNow"
  }
};
