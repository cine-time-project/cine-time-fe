export const EXPERIENCES = {
  "imax": {
    variant: "hero",
    heroImage: "/images/experiences/imax-hero.jpg",
    titleKey: "experiences.imax.title",
    subtitleKey: "experiences.imax.subtitle",
    bodyKey: "experiences.imax.body",
    tiles: [
      { titleKey: "experiences.shared.crystalClear", descKey: "experiences.imax.tile1" },
      { titleKey: "experiences.shared.massiveScreen", descKey: "experiences.imax.tile2" },
      { titleKey: "experiences.shared.preciseSound", descKey: "experiences.imax.tile3" }
    ],
    features: [
      { icon: "📽️", textKey: "experiences.shared.laserProjection" },
      { icon: "🎧", textKey: "experiences.shared.immersiveAudio" },
      { icon: "🪑", textKey: "experiences.shared.premiumSeats" }
    ],
    ctaKey: "experiences.shared.bookNow"
  },

  "4dx": {
    variant: "tiles",
    heroImage: "/images/experiences/4dx-hero.jpg",
    titleKey: "experiences.4dx.title",
    subtitleKey: "experiences.4dx.subtitle",
    bodyKey: "experiences.4dx.body",
    tiles: [
      { titleKey: "experiences.4dx.motion", descKey: "experiences.4dx.motionDesc" },
      { titleKey: "experiences.4dx.scent",  descKey: "experiences.4dx.scentDesc"  },
      { titleKey: "experiences.4dx.wind",   descKey: "experiences.4dx.windDesc"   },
      { titleKey: "experiences.4dx.rain",   descKey: "experiences.4dx.rainDesc"   }
    ],
    features: [
      { icon: "↔️", textKey: "experiences.4dx.dynamicChairs" },
      { icon: "💨", textKey: "experiences.4dx.environmentFX" }
    ],
    ctaKey: "experiences.shared.bookNow"
  },

  "dolby-atmos": {
    variant: "hero",
    heroImage: "/images/experiences/atmos-hero.jpg",
    titleKey: "experiences.atmos.title",
    subtitleKey: "experiences.atmos.subtitle",
    bodyKey: "experiences.atmos.body",
    tiles: [
      { titleKey: "experiences.atmos.objectAudio", descKey: "experiences.atmos.objectAudioDesc" },
      { titleKey: "experiences.atmos.ceilingSpeakers", descKey: "experiences.atmos.ceilingDesc" }
    ],
    features: [
      { icon: "🔊", textKey: "experiences.atmos.precision" },
      { icon: "🧭", textKey: "experiences.atmos.placement" }
    ],
    ctaKey: "experiences.shared.bookNow"
  },

  "vip": {
    variant: "tiles",
    heroImage: "/images/experiences/vip-hero.jpg",
    titleKey: "experiences.vip.title",
    subtitleKey: "experiences.vip.subtitle",
    bodyKey: "experiences.vip.body",
    tiles: [
      { titleKey: "experiences.vip.recliners", descKey: "experiences.vip.reclinersDesc" },
      { titleKey: "experiences.vip.lounge",    descKey: "experiences.vip.loungeDesc"    },
      { titleKey: "experiences.vip.service",   descKey: "experiences.vip.serviceDesc"   }
    ],
    features: [
      { icon: "🥂", textKey: "experiences.vip.welcomeDrink" },
      { icon: "🛋️", textKey: "experiences.vip.extraComfort" }
    ],
    ctaKey: "experiences.shared.reserve"
  },

  "family-lounge": {
    variant: "hero",
    heroImage: "/images/experiences/family-hero.jpg",
    titleKey: "experiences.family.title",
    subtitleKey: "experiences.family.subtitle",
    bodyKey: "experiences.family.body",
    tiles: [
      { titleKey: "experiences.family.kidsArea", descKey: "experiences.family.kidsAreaDesc" },
      { titleKey: "experiences.family.babyCare", descKey: "experiences.family.babyCareDesc" }
    ],
    features: [
      { icon: "🧸", textKey: "experiences.family.toys" },
      { icon: "🍼", textKey: "experiences.family.babyFriendly" }
    ],
    ctaKey: "experiences.shared.bookNow"
  }
};
