export type Locale = "fr" | "ar";

export type NavigationLink = {
  href: string;
  label: string;
};

export type PageContent = {
  title: string;
  description: string;
  navigation: NavigationLink[];
  footer: {
    address: string;
    phone: string;
    email: string;
  };
};

export const localeContent: Record<Locale, PageContent> = {
  fr: {
    title: "Themis Law Firm — Saadaoui & Haddad",
    description:
      "Cabinet d’avocats bilingue spécialisé en droit pénal, civil, commercial et familial.",
    navigation: [
      { href: "/fr", label: "Accueil" },
      { href: "/fr/expertises", label: "Expertises" },
      { href: "/fr/equipe", label: "Équipe" },
      { href: "/fr/rendez-vous", label: "Rendez-vous" },
      { href: "/fr/contact", label: "Contact" },
    ],
    footer: {
      address: "Adresse du cabinet, Tunis, Tunisie",
      phone: "+216 00 000 000",
      email: "contact@themis-lawfirm.tn",
    },
  },
  ar: {
    title: "مكتب ثيميس للمحاماة — سعداوي و الحدّاد",
    description: "مكتب محاماة ثنائي اللغة متخصص في القانون الجنائي والمدني والتجاري والأُسري.",
    navigation: [
      { href: "/ar", label: "الصفحة الرئيسية" },
      { href: "/ar/expertise", label: "التخصصات" },
      { href: "/ar/team", label: "الفريق" },
      { href: "/ar/booking", label: "الحجز" },
      { href: "/ar/contact", label: "اتصل" },
    ],
    footer: {
      address: "عنوان المكتب، تونس، تونس",
      phone: "+216 00 000 000",
      email: "contact@themis-lawfirm.tn",
    },
  },
};
