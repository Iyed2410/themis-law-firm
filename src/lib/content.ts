/**
 * Bilingual content layer — single source of truth for all public-facing text.
 *
 * All content marked [PLACEHOLDER] must be replaced with client-approved text
 * before the site goes live. See docs/PROGRESS.md for the full list of
 * provisional content items.
 *
 * No invented credentials, bar memberships, success rates, or guaranteed
 * outcomes appear in this file.
 */

export type Locale = "fr" | "ar";

export type NavigationLink = {
  href: string;
  label: string;
};

// ---------------------------------------------------------------------------
// Expertise
// ---------------------------------------------------------------------------

export type ExpertiseItem = {
  /** Anchor id used for deep-links e.g. #droit-penal */
  anchor: string;
  titleFr: string;
  titleAr: string;
  introFr: string;
  introAr: string;
  mattersFr: string[];
  mattersAr: string[];
  audienceFr: string;
  audienceAr: string;
  howFr: string;
  howAr: string;
};

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

export type LawyerProfile = {
  /** Placeholder display name — replace before launch */
  nameFr: string;
  nameAr: string;
  titleFr: string;
  titleAr: string;
  /** Languages the lawyer speaks */
  languages: string[];
  bioFr: string;
  bioAr: string;
};

// ---------------------------------------------------------------------------
// Representative matters
// ---------------------------------------------------------------------------

export type RepresentativeMatter = {
  areaFr: string;
  areaAr: string;
  summaryFr: string;
  summaryAr: string;
};

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export type Review = {
  /** Display alias only — no real client names */
  alias: string;
  rating: 1 | 2 | 3 | 4 | 5;
  textFr: string;
  textAr: string;
};

// ---------------------------------------------------------------------------
// Booking field labels
// ---------------------------------------------------------------------------

export type BookingContent = {
  headingFr: string;
  headingAr: string;
  subheadingFr: string;
  subheadingAr: string;
  warningFr: string;
  warningAr: string;
  weekendNoticeFr: string;
  weekendNoticeAr: string;
  submitPendingFr: string;
  submitPendingAr: string;
  consentFr: string;
  consentAr: string;
  disclaimerFr: string;
  disclaimerAr: string;
};

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

export type ContactContent = {
  addressFr: string;
  addressAr: string;
  phone: string;
  email: string;
  hoursFr: string;
  hoursAr: string;
  mapTitleFr: string;
  mapTitleAr: string;
  mapFallbackLabelFr: string;
  mapFallbackLabelAr: string;
  mapFallbackUrl: string;
};

// ---------------------------------------------------------------------------
// Root content type
// ---------------------------------------------------------------------------

export type SiteContent = {
  /** When false, the Reviews page is hidden from navigation, sitemap, and routing */
  reviewsEnabled: boolean;

  /** Legacy footer-level content kept for compatibility */
  footer: {
    address: string;
    phone: string;
    email: string;
  };

  /** Per-page localized metadata */
  meta: Record<
    string,
    { titleFr: string; titleAr: string; descFr: string; descAr: string }
  >;

  home: {
    heroFr: string;
    heroAr: string;
    subFr: string;
    subAr: string;
    ctaBookFr: string;
    ctaBookAr: string;
    ctaAboutFr: string;
    ctaAboutAr: string;
    intro1Fr: string;
    intro1Ar: string;
    intro2Fr: string;
    intro2Ar: string;
  };

  cabinet: {
    headingFr: string;
    headingAr: string;
    para1Fr: string;
    para1Ar: string;
    para2Fr: string;
    para2Ar: string;
    valuesFr: string[];
    valuesAr: string[];
  };

  expertises: ExpertiseItem[];

  equipe: {
    headingFr: string;
    headingAr: string;
    lawyers: LawyerProfile[];
  };

  experience: {
    headingFr: string;
    headingAr: string;
    disclaimerFr: string;
    disclaimerAr: string;
    matters: RepresentativeMatter[];
  };

  avis: {
    headingFr: string;
    headingAr: string;
    reviews: Review[];
  };

  booking: BookingContent;

  contact: ContactContent;

  privacy: {
    headingFr: string;
    headingAr: string;
    bodyFr: string;
    bodyAr: string;
  };

  legal: {
    headingFr: string;
    headingAr: string;
    bodyFr: string;
    bodyAr: string;
  };
};

// ---------------------------------------------------------------------------
// Content data
// ---------------------------------------------------------------------------

export const siteContent: SiteContent = {
  /**
   * Set to false to hide the Reviews page from navigation, routing, and sitemap.
   * [PLACEHOLDER] — set to true once the firm approves at least one review.
   */
  reviewsEnabled: false,

  footer: {
    address: "Adresse du cabinet, Tunis, Tunisie", // [PLACEHOLDER]
    phone: "+216 00 000 000", // [PLACEHOLDER]
    email: "contact@themis-lawfirm.tn", // [PLACEHOLDER]
  },

  meta: {
    home: {
      titleFr: "Themis Law Firm — Saadaoui & Haddad | Cabinet d'avocats à Tunis",
      titleAr: "مكتب ثيميس للمحاماة — سعداوي والحدّاد | محامون في تونس",
      descFr:
        "Cabinet d'avocats bilingue français-arabe à Tunis. Droit pénal, civil, commercial, familial et plus. Prenez rendez-vous en ligne.",
      descAr:
        "مكتب محاماة ثنائي اللغة في تونس. قانون جنائي، مدني، تجاري، أسري والمزيد. احجز موعدك عبر الإنترنت.",
    },
    cabinet: {
      titleFr: "Notre cabinet | Themis Law Firm",
      titleAr: "عن المكتب | مكتب ثيميس للمحاماة",
      descFr:
        "Découvrez Themis Law Firm, cabinet d'avocats bilingue fondé sur la rigueur, l'éthique et l'engagement envers ses clients.",
      descAr:
        "تعرّف على مكتب ثيميس للمحاماة، مكتب محاماة ثنائي اللغة مبني على الصرامة والأخلاق والالتزام تجاه الموكلين.",
    },
    expertises: {
      titleFr: "Domaines d'expertise | Themis Law Firm",
      titleAr: "مجالات التخصص | مكتب ثيميس للمحاماة",
      descFr:
        "Droit pénal, civil, immobilier, commercial, des sociétés, maritime, familial, propriété intellectuelle et droit du travail.",
      descAr:
        "القانون الجزائي، المدني، العقاري، التجاري، الشركات، البحري، الأسرة، الملكية الفكرية وقانون الشغل.",
    },
    equipe: {
      titleFr: "Notre équipe | Themis Law Firm",
      titleAr: "فريقنا | مكتب ثيميس للمحاماة",
      descFr: "Rencontrez les avocats de Themis Law Firm, dévoués à défendre vos intérêts.",
      descAr: "تعرّف على محامي مكتب ثيميس للمحاماة، المكرّسين للدفاع عن مصالحك.",
    },
    experience: {
      titleFr: "Expériences représentatives | Themis Law Firm",
      titleAr: "المرافعات التمثيلية | مكتب ثيميس للمحاماة",
      descFr:
        "Quelques affaires anonymisées traitées par le cabinet, présentées sans garantie de résultat.",
      descAr: "بعض القضايا المُجهَّلة التي تناولها المكتب، مقدَّمة دون ضمان للنتائج.",
    },
    avis: {
      titleFr: "Avis clients | Themis Law Firm",
      titleAr: "آراء الموكلين | مكتب ثيميس للمحاماة",
      descFr: "Ce que nos clients disent de leur expérience avec Themis Law Firm.",
      descAr: "ما يقوله موكلونا عن تجربتهم مع مكتب ثيميس للمحاماة.",
    },
    "rendez-vous": {
      titleFr: "Prendre rendez-vous | Themis Law Firm",
      titleAr: "حجز موعد | مكتب ثيميس للمحاماة",
      descFr:
        "Demandez une consultation avec nos avocats. La confirmation sera effectuée par notre équipe.",
      descAr: "اطلب استشارة مع محامينا. سيتم التأكيد من قِبَل فريقنا.",
    },
    contact: {
      titleFr: "Contact | Themis Law Firm",
      titleAr: "اتصل بنا | مكتب ثيميس للمحاماة",
      descFr: "Coordonnées, horaires et localisation de Themis Law Firm à Tunis.",
      descAr: "بيانات الاتصال وساعات العمل وموقع مكتب ثيميس للمحاماة في تونس.",
    },
    confidentialite: {
      titleFr: "Politique de confidentialité | Themis Law Firm",
      titleAr: "سياسة الخصوصية | مكتب ثيميس للمحاماة",
      descFr: "Comment Themis Law Firm traite vos données personnelles.",
      descAr: "كيف يتعامل مكتب ثيميس للمحاماة مع بياناتك الشخصية.",
    },
    "mentions-legales": {
      titleFr: "Mentions légales | Themis Law Firm",
      titleAr: "البيانات القانونية | مكتب ثيميس للمحاماة",
      descFr: "Mentions légales, avertissements professionnels et informations réglementaires.",
      descAr: "البيانات القانونية والتحذيرات المهنية والمعلومات التنظيمية.",
    },
  },

  home: {
    heroFr: "L'excellence juridique au service de vos droits",
    heroAr: "التميّز القانوني في خدمة حقوقكم",
    subFr:
      "Cabinet d'avocats bilingue français-arabe à Tunis. Nous vous accompagnons avec rigueur et éthique dans tous vos dossiers.",
    subAr:
      "مكتب محاماة ثنائي اللغة في تونس. نرافقكم بصرامة وأخلاق في جميع ملفاتكم.",
    ctaBookFr: "Prendre rendez-vous",
    ctaBookAr: "حجز موعد",
    ctaAboutFr: "Découvrir le cabinet",
    ctaAboutAr: "اكتشف المكتب",
    intro1Fr:
      "Themis Law Firm est un cabinet d'avocats fondé sur des valeurs de rigueur, d'éthique et de proximité. Nous intervenons en français et en arabe pour accompagner nos clients dans la défense de leurs intérêts.", // [PLACEHOLDER]
    intro1Ar:
      "مكتب ثيميس للمحاماة مكتب محاماة مبني على قيم الصرامة والأخلاق والقرب من الموكل. نتدخل باللغتين الفرنسية والعربية لمرافقة موكلينا في الدفاع عن مصالحهم.", // [PLACEHOLDER]
    intro2Fr:
      "Notre équipe vous reçoit sur rendez-vous du lundi au vendredi, de 08h00 à 17h00, et traite les demandes exceptionnelles de week-end après examen manuel.", // [PLACEHOLDER]
    intro2Ar:
      "يستقبلكم فريقنا بموعد من الاثنين إلى الجمعة من الساعة 08:00 إلى 17:00، ويعالج طلبات عطلة نهاية الأسبوع الاستثنائية بعد الفحص اليدوي.", // [PLACEHOLDER]
  },

  cabinet: {
    headingFr: "Notre cabinet",
    headingAr: "مكتبنا",
    para1Fr:
      "Themis Law Firm — Saadaoui & Haddad est un cabinet d'avocats bilingue installé à Tunis. Il offre un accompagnement juridique rigoureux en français et en arabe dans de nombreux domaines du droit tunisien et international.", // [PLACEHOLDER]
    para1Ar:
      "مكتب ثيميس للمحاماة — سعداوي والحدّاد مكتب محاماة ثنائي اللغة مقره تونس. يقدم مرافقة قانونية صارمة باللغتين الفرنسية والعربية في مجالات عديدة من القانون التونسي والدولي.", // [PLACEHOLDER]
    para2Fr:
      "Le cabinet place l'éthique professionnelle, la transparence et le respect de la confidentialité au cœur de chaque relation avec ses clients. Chaque dossier est traité avec le même niveau d'attention, quelle que soit sa complexité.", // [PLACEHOLDER]
    para2Ar:
      "يضع المكتب الأخلاق المهنية والشفافية وصون السرية في صميم كل علاقة مع موكليه. يُعالَج كل ملف بالمستوى ذاته من الاهتمام، بغض النظر عن تعقيده.", // [PLACEHOLDER]
    valuesFr: [
      "Rigueur et précision juridique",
      "Éthique et indépendance professionnelle",
      "Confidentialité absolue",
      "Accompagnement bilingue français-arabe",
      "Respect des délais et des engagements",
    ],
    valuesAr: [
      "الصرامة والدقة القانونية",
      "الأخلاق والاستقلالية المهنية",
      "السرية المطلقة",
      "المرافقة ثنائية اللغة فرنسية-عربية",
      "الاحترام الدقيق للمواعيد والالتزامات",
    ],
  },

  expertises: [
    {
      anchor: "droit-penal",
      titleFr: "Droit pénal",
      titleAr: "القانون الجزائي",
      introFr:
        "Le cabinet intervient en matière pénale aussi bien en défense des personnes poursuivies qu'en représentation des parties civiles.", // [PLACEHOLDER]
      introAr:
        "يتدخل المكتب في المادة الجزائية سواء في الدفاع عن الأشخاص المتابَعين أو في تمثيل الأطراف المدنية.", // [PLACEHOLDER]
      mattersFr: [
        "Défense en matière criminelle et correctionnelle",
        "Représentation des victimes et parties civiles",
        "Infractions économiques et financières",
        "Droit de la presse et infractions numériques",
      ],
      mattersAr: [
        "الدفاع في المادة الجنائية والتأديبية",
        "تمثيل الضحايا والأطراف المدنية",
        "الجرائم الاقتصادية والمالية",
        "قانون الصحافة والجرائم الرقمية",
      ],
      audienceFr:
        "Personnes physiques ou morales faisant l'objet de poursuites, victimes d'infractions, entreprises exposées à un risque pénal.", // [PLACEHOLDER]
      audienceAr:
        "الأشخاص الطبيعيون أو المعنويون الخاضعون للملاحقة القضائية، وضحايا الجرائم، والشركات المعرّضة لمخاطر جزائية.", // [PLACEHOLDER]
      howFr:
        "Le cabinet assure votre défense à tous les stades de la procédure, de l'enquête préliminaire au jugement définitif, en veillant au respect de vos droits fondamentaux.", // [PLACEHOLDER]
      howAr:
        "يضمن المكتب دفاعكم في جميع مراحل الإجراءات، من التحقيق الأولي إلى الحكم النهائي، مع الحرص على احترام حقوقكم الأساسية.", // [PLACEHOLDER]
    },
    {
      anchor: "droit-civil",
      titleFr: "Droit civil",
      titleAr: "القانون المدني",
      introFr:
        "Le cabinet conseille et représente ses clients dans l'ensemble des litiges civils, des contrats aux successions, en passant par la responsabilité.", // [PLACEHOLDER]
      introAr:
        "يُشاور المكتب موكليه ويمثلهم في جميع النزاعات المدنية، من العقود إلى الميراث، مروراً بالمسؤولية.", // [PLACEHOLDER]
      mattersFr: [
        "Contentieux contractuels et inexécution",
        "Responsabilité civile délictuelle et contractuelle",
        "Successions et partages",
        "Obligations et recouvrement de créances",
      ],
      mattersAr: [
        "النزاعات التعاقدية وعدم التنفيذ",
        "المسؤولية المدنية التقصيرية والعقدية",
        "الإرث والأقسام",
        "الالتزامات واسترداد الديون",
      ],
      audienceFr:
        "Particuliers et entreprises confrontés à un litige civil ou souhaitant sécuriser leurs engagements contractuels.", // [PLACEHOLDER]
      audienceAr:
        "الأفراد والشركات الذين يواجهون نزاعاً مدنياً أو يرغبون في تأمين التزاماتهم التعاقدية.", // [PLACEHOLDER]
      howFr:
        "Rédaction et audit de contrats, négociation amiable, assistance devant les juridictions civiles.", // [PLACEHOLDER]
      howAr:
        "صياغة العقود ومراجعتها، التفاوض الودي، المساعدة أمام المحاكم المدنية.", // [PLACEHOLDER]
    },
    {
      anchor: "droit-immobilier",
      titleFr: "Droit immobilier et foncier",
      titleAr: "القانون العقاري",
      introFr:
        "Le cabinet accompagne ses clients dans toutes les étapes de leurs projets immobiliers et dans la résolution de leurs litiges fonciers.", // [PLACEHOLDER]
      introAr:
        "يرافق المكتب موكليه في جميع مراحل مشاريعهم العقارية وفي تسوية نزاعاتهم العقارية.", // [PLACEHOLDER]
      mattersFr: [
        "Transactions immobilières et due diligence",
        "Copropriété et règlements de lotissement",
        "Litiges fonciers et revendications de propriété",
        "Baux commerciaux et résidentiels",
      ],
      mattersAr: [
        "المعاملات العقارية والعناية الواجبة",
        "الملكية المشتركة ولوائح التقسيم",
        "النزاعات العقارية ودعاوى الملكية",
        "عقود إيجار تجارية وسكنية",
      ],
      audienceFr:
        "Propriétaires, promoteurs, investisseurs et syndicats de copropriété.", // [PLACEHOLDER]
      audienceAr: "الملاك والمطوّرون والمستثمرون وهيئات الملكية المشتركة.", // [PLACEHOLDER]
      howFr:
        "Conseil à la transaction, vérification des titres, rédaction d'actes et représentation devant les tribunaux fonciers.", // [PLACEHOLDER]
      howAr:
        "الاستشارة في المعاملات، والتحقق من الصكوك، وصياغة الوثائق، والتمثيل أمام المحاكم العقارية.", // [PLACEHOLDER]
    },
    {
      anchor: "droit-commercial",
      titleFr: "Droit commercial et des affaires",
      titleAr: "القانون التجاري وقانون الأعمال",
      introFr:
        "Le cabinet conseille les entreprises et entrepreneurs tunisiens et étrangers dans leurs opérations commerciales et la gestion de leurs risques juridiques.", // [PLACEHOLDER]
      introAr:
        "يُشاور المكتب الشركات وأصحاب الأعمال التونسيين والأجانب في عملياتهم التجارية وإدارة مخاطرهم القانونية.", // [PLACEHOLDER]
      mattersFr: [
        "Contrats commerciaux et distribution",
        "Recouvrement de créances commerciales",
        "Contentieux entre partenaires commerciaux",
        "Fonds de commerce et cession d'activités",
      ],
      mattersAr: [
        "العقود التجارية والتوزيع",
        "استرداد الديون التجارية",
        "النزاعات بين الشركاء التجاريين",
        "الأصول التجارية ونقل الأنشطة",
      ],
      audienceFr:
        "PME, startups, commerçants, importateurs-exportateurs et groupes internationaux opérant en Tunisie.", // [PLACEHOLDER]
      audienceAr:
        "المؤسسات الصغيرة والمتوسطة والشركات الناشئة والتجار والمستوردون-المصدّرون والمجموعات الدولية العاملة في تونس.", // [PLACEHOLDER]
      howFr:
        "Rédaction et audit de contrats commerciaux, assistance dans les négociations, représentation dans les litiges commerciaux.", // [PLACEHOLDER]
      howAr:
        "صياغة العقود التجارية ومراجعتها، والمساعدة في المفاوضات، والتمثيل في النزاعات التجارية.", // [PLACEHOLDER]
    },
    {
      anchor: "droit-societes",
      titleFr: "Droit des sociétés",
      titleAr: "قانون الشركات",
      introFr:
        "Le cabinet assiste les dirigeants et actionnaires à toutes les étapes de la vie de leur société, de la création à la dissolution.", // [PLACEHOLDER]
      introAr:
        "يساعد المكتب المسيّرين والمساهمين في جميع مراحل حياة شركتهم، من التأسيس إلى الحل.", // [PLACEHOLDER]
      mattersFr: [
        "Constitution et structuration de sociétés",
        "Gouvernance et pactes d'associés",
        "Cessions de parts et acquisitions",
        "Restructurations, fusions et liquidations",
      ],
      mattersAr: [
        "تأسيس الشركات وهيكلتها",
        "الحوكمة واتفاقيات الشركاء",
        "نقل الحصص والاستحواذات",
        "إعادة الهيكلة والاندماجات والتصفية",
      ],
      audienceFr:
        "Fondateurs, associés, dirigeants d'entreprises tunisiennes et investisseurs étrangers.", // [PLACEHOLDER]
      audienceAr: "المؤسسون والشركاء ومسيّرو الشركات التونسية والمستثمرون الأجانب.", // [PLACEHOLDER]
      howFr:
        "Rédaction de statuts, suivi des assemblées générales, accompagnement dans les opérations de haut de bilan.", // [PLACEHOLDER]
      howAr:
        "صياغة النظام الأساسي، ومتابعة الجمعيات العامة، والمرافقة في عمليات الهيكل المالي للشركة.", // [PLACEHOLDER]
    },
    {
      anchor: "droit-maritime",
      titleFr: "Droit maritime",
      titleAr: "القانون البحري",
      introFr:
        "Le cabinet intervient dans les litiges et opérations relevant du droit maritime tunisien et des conventions internationales.", // [PLACEHOLDER]
      introAr:
        "يتدخل المكتب في النزاعات والعمليات المتعلقة بالقانون البحري التونسي والاتفاقيات الدولية.", // [PLACEHOLDER]
      mattersFr: [
        "Contrats de transport maritime et affrètement",
        "Avaries et sinistres de cargaison",
        "Saisies conservatoires de navires",
        "Responsabilité des armateurs",
      ],
      mattersAr: [
        "عقود النقل البحري والشحن",
        "الأضرار والخسائر في الشحنة",
        "الحجز الاحتياطي على السفن",
        "مسؤولية مالكي السفن",
      ],
      audienceFr:
        "Armateurs, chargeurs, transitaires, assureurs maritimes et opérateurs portuaires.", // [PLACEHOLDER]
      audienceAr:
        "مالكو السفن والشاحنون والوسطاء الجمركيون وشركات التأمين البحري ومشغّلو الموانئ.", // [PLACEHOLDER]
      howFr:
        "Conseil aux opérateurs maritimes, saisies de navires, représentation dans les litiges devant les tribunaux compétents.", // [PLACEHOLDER]
      howAr:
        "الاستشارة للمشغّلين البحريين، وحجز السفن، والتمثيل في النزاعات أمام المحاكم المختصة.", // [PLACEHOLDER]
    },
    {
      anchor: "droit-famille",
      titleFr: "Droit de la famille",
      titleAr: "قانون الأسرة",
      introFr:
        "Le cabinet traite les affaires familiales avec discrétion, en accompagnant les clients dans les étapes parfois difficiles de la vie familiale.", // [PLACEHOLDER]
      introAr:
        "يتناول المكتب قضايا الأسرة بتحفّظ، مرافقاً موكليه في المراحل التي قد تكون صعبة أحياناً من الحياة الأسرية.", // [PLACEHOLDER]
      mattersFr: [
        "Divorce et séparation",
        "Garde des enfants et droit de visite",
        "Pension alimentaire",
        "Successions et régimes matrimoniaux",
      ],
      mattersAr: [
        "الطلاق والانفصال",
        "حضانة الأطفال وحق الزيارة",
        "نفقة الإعالة",
        "الميراث وأنظمة الزواج",
      ],
      audienceFr: "Couples, familles et particuliers confrontés à une situation familiale contentieuse.", // [PLACEHOLDER]
      audienceAr: "الأزواج والأسر والأفراد الذين يواجهون وضعاً أسرياً نزاعياً.", // [PLACEHOLDER]
      howFr:
        "Assistance dans les procédures judiciaires et accompagnement vers les solutions amiables lorsque possible.", // [PLACEHOLDER]
      howAr:
        "المساعدة في الإجراءات القضائية والمرافقة نحو الحلول الودية حين يكون ذلك ممكناً.", // [PLACEHOLDER]
    },
    {
      anchor: "propriete-intellectuelle",
      titleFr: "Propriété intellectuelle",
      titleAr: "الملكية الفكرية",
      introFr:
        "Le cabinet conseille créateurs, entreprises et innovateurs dans la protection et la valorisation de leurs droits intellectuels.", // [PLACEHOLDER]
      introAr:
        "يُشاور المكتب المبدعين والشركات والمبتكرين في حماية حقوقهم الفكرية وتثمينها.", // [PLACEHOLDER]
      mattersFr: [
        "Marques, dessins et modèles",
        "Droit d'auteur et droits voisins",
        "Brevets d'invention",
        "Concurrence déloyale et contrefaçon",
      ],
      mattersAr: [
        "العلامات التجارية والرسومات والنماذج",
        "حق المؤلف والحقوق المجاورة",
        "براءات الاختراع",
        "المنافسة غير المشروعة والتقليد",
      ],
      audienceFr:
        "Artistes, auteurs, inventeurs, entreprises innovantes et marques souhaitant protéger leurs actifs immatériels.", // [PLACEHOLDER]
      audienceAr:
        "الفنانون والمؤلفون والمخترعون والشركات المبتكرة والعلامات التجارية الراغبة في حماية أصولها غير المادية.", // [PLACEHOLDER]
      howFr:
        "Dépôts, surveillance, actions en contrefaçon et négociation de licences.", // [PLACEHOLDER]
      howAr: "الإيداعات والمراقبة ودعاوى التقليد والتفاوض على التراخيص.", // [PLACEHOLDER]
    },
    {
      anchor: "droit-travail",
      titleFr: "Droit du travail et de l'emploi",
      titleAr: "قانون الشغل والتوظيف",
      introFr:
        "Le cabinet accompagne employeurs et salariés dans la gestion des relations de travail et la résolution des conflits professionnels.", // [PLACEHOLDER]
      introAr:
        "يرافق المكتب أصحاب العمل والعمّال في إدارة علاقات الشغل وحل النزاعات المهنية.", // [PLACEHOLDER]
      mattersFr: [
        "Rédaction et révision de contrats de travail",
        "Licenciements et procédures disciplinaires",
        "Contentieux prud'homal",
        "Harcèlement et discrimination",
      ],
      mattersAr: [
        "صياغة عقود الشغل ومراجعتها",
        "الفصل من العمل والإجراءات التأديبية",
        "النزاعات أمام مجالس الشغل",
        "التحرش والتمييز",
      ],
      audienceFr: "Employeurs, DRH, salariés et représentants du personnel.", // [PLACEHOLDER]
      audienceAr: "أصحاب العمل ومديرو الموارد البشرية والعمّال وممثلو الموظفين.", // [PLACEHOLDER]
      howFr:
        "Conseil préventif, assistance dans les procédures de licenciement, représentation devant les juridictions du travail.", // [PLACEHOLDER]
      howAr:
        "الاستشارة الوقائية، والمساعدة في إجراءات الفصل، والتمثيل أمام محاكم الشغل.", // [PLACEHOLDER]
    },
  ],

  equipe: {
    headingFr: "Notre équipe",
    headingAr: "فريقنا",
    lawyers: [
      {
        // [PLACEHOLDER] Replace with client-approved name before launch
        nameFr: "Maître [Prénom Nom]",
        nameAr: "الأستاذ [الاسم]",
        titleFr: "Avocat associé — Administrateur",
        titleAr: "محامٍ شريك — مدير",
        languages: ["Français", "Arabe"],
        // [PLACEHOLDER] Replace with approved biography
        bioFr:
          "Maître [Prénom Nom] est l'associé administrateur du cabinet. Spécialisé dans [domaines], il accompagne des clients en français et en arabe depuis de nombreuses années.",
        bioAr:
          "الأستاذ [الاسم] هو الشريك المسيّر للمكتب. متخصص في [المجالات]، يرافق موكليه باللغتين الفرنسية والعربية منذ سنوات عديدة.",
      },
      {
        // [PLACEHOLDER] Replace with client-approved name before launch
        nameFr: "Maître [Prénom Nom]",
        nameAr: "الأستاذ [الاسم]",
        titleFr: "Avocat",
        titleAr: "محامٍ",
        languages: ["Français", "Arabe"],
        // [PLACEHOLDER] Replace with approved biography
        bioFr:
          "Maître [Prénom Nom] intervient dans les domaines du [domaines]. Il reçoit les clients en français et en arabe.",
        bioAr:
          "الأستاذ [الاسم] يتدخل في مجالات [المجالات]. يستقبل الموكلين باللغتين الفرنسية والعربية.",
      },
      {
        // [PLACEHOLDER] Replace with client-approved name before launch
        nameFr: "Maître [Prénom Nom]",
        nameAr: "الأستاذ [الاسم]",
        titleFr: "Avocat",
        titleAr: "محامٍ",
        languages: ["Français", "Arabe", "English"],
        // [PLACEHOLDER] Replace with approved biography
        bioFr:
          "Maître [Prénom Nom] intervient dans les domaines du [domaines]. Il reçoit les clients en français, en arabe et en anglais.",
        bioAr:
          "الأستاذ [الاسم] يتدخل في مجالات [المجالات]. يستقبل الموكلين بالفرنسية والعربية والإنجليزية.",
      },
    ],
  },

  experience: {
    headingFr: "Expériences représentatives",
    headingAr: "المرافعات التمثيلية",
    // Required disclaimer — do not remove
    disclaimerFr:
      "Les affaires présentées ci-dessous sont anonymisées. Aucun nom de client, numéro de dossier ni montant confidentiel n'est divulgué. Les résultats passés ne garantissent pas des résultats similaires dans des affaires futures.",
    disclaimerAr:
      "القضايا المعروضة أدناه مُجهَّلة الهوية. لا يُكشف عن أي اسم موكّل أو رقم ملف أو مبلغ سري. النتائج السابقة لا تضمن نتائج مماثلة في القضايا المستقبلية.",
    matters: [
      {
        // [PLACEHOLDER] Replace with approved anonymized matter
        areaFr: "Droit commercial",
        areaAr: "القانون التجاري",
        summaryFr:
          "Assistance d'une entreprise tunisienne dans la résolution d'un litige contractuel avec un partenaire étranger. Règlement amiable obtenu après négociation.",
        summaryAr:
          "مساعدة شركة تونسية في حل نزاع تعاقدي مع شريك أجنبي. تم الحصول على تسوية ودية بعد التفاوض.",
      },
      {
        // [PLACEHOLDER] Replace with approved anonymized matter
        areaFr: "Droit immobilier",
        areaAr: "القانون العقاري",
        summaryFr:
          "Représentation d'un propriétaire dans un litige de copropriété portant sur des travaux non autorisés. Décision favorable obtenue en première instance.",
        summaryAr:
          "تمثيل مالك في نزاع ملكية مشتركة يتعلق بأشغال غير مرخصة. صدر قرار مؤيّد في الدرجة الأولى.",
      },
      {
        // [PLACEHOLDER] Replace with approved anonymized matter
        areaFr: "Droit du travail",
        areaAr: "قانون الشغل",
        summaryFr:
          "Conseil d'un employeur dans le cadre d'une procédure de licenciement collectif, en veillant à la conformité avec la législation tunisienne du travail.",
        summaryAr:
          "استشارة صاحب عمل في إطار إجراء فصل جماعي، مع الحرص على الامتثال للتشريع التونسي للشغل.",
      },
    ],
  },

  avis: {
    headingFr: "Ce que disent nos clients",
    headingAr: "ما يقوله موكلونا",
    // [PLACEHOLDER] Replace with genuine approved reviews only
    reviews: [
      {
        alias: "Client A.",
        rating: 5,
        textFr:
          "Un accompagnement professionnel et attentionné tout au long de ma procédure. Je recommande vivement.", // [PLACEHOLDER]
        textAr: "مرافقة مهنية ومتيقظة طوال إجراءاتي. أوصي بشدة.", // [PLACEHOLDER]
      },
      {
        alias: "Entreprise B.",
        rating: 5,
        textFr:
          "Réactivité, clarté des explications et rigueur dans le suivi du dossier. Un cabinet de confiance.", // [PLACEHOLDER]
        textAr: "سرعة الاستجابة ووضوح التفسيرات والصرامة في متابعة الملف. مكتب موثوق.", // [PLACEHOLDER]
      },
    ],
  },

  booking: {
    headingFr: "Demander un rendez-vous",
    headingAr: "طلب موعد",
    subheadingFr:
      "Remplissez le formulaire ci-dessous. Notre équipe examinera votre demande et vous contactera pour confirmer la date et l'heure.",
    subheadingAr:
      "أكمل النموذج أدناه. سيراجع فريقنا طلبك ويتصل بك لتأكيد التاريخ والوقت.",
    warningFr:
      "⚠ Ne soumettez pas d'informations confidentielles, urgentes ou hautement sensibles via ce formulaire. La soumission ne crée pas de relation avocat-client.",
    warningAr:
      "⚠ لا تُرسل معلومات سرية أو عاجلة أو شديدة الحساسية عبر هذا النموذج. تقديم الطلب لا يُنشئ علاقة محامٍ-موكّل.",
    weekendNoticeFr:
      "Les rendez-vous du week-end sont exceptionnels et nécessitent une approbation manuelle de notre équipe.",
    weekendNoticeAr:
      "مواعيد عطلة نهاية الأسبوع استثنائية وتتطلب موافقة يدوية من فريقنا.",
    submitPendingFr:
      "La soumission sera activée dans la phase de réservation. Veuillez nous contacter directement pour l'instant.",
    submitPendingAr:
      "سيتم تفعيل الإرسال في مرحلة الحجز. يُرجى التواصل معنا مباشرةً في الوقت الحالي.",
    consentFr:
      "J'accepte la politique de confidentialité et le traitement de mes données personnelles aux fins de réponse à ma demande.",
    consentAr:
      "أوافق على سياسة الخصوصية ومعالجة بياناتي الشخصية لأغراض الرد على طلبي.",
    disclaimerFr:
      "La soumission de ce formulaire ne crée pas de relation avocat-client et ne constitue pas un avis juridique.",
    disclaimerAr:
      "تقديم هذا النموذج لا يُنشئ علاقة محامٍ-موكّل ولا يُشكّل استشارة قانونية.",
  },

  contact: {
    addressFr: "Adresse du cabinet, Tunis, Tunisie", // [PLACEHOLDER]
    addressAr: "عنوان المكتب، تونس، تونس", // [PLACEHOLDER]
    phone: "+216 00 000 000", // [PLACEHOLDER]
    email: "contact@themis-lawfirm.tn", // [PLACEHOLDER]
    hoursFr: "Lundi – Vendredi : 08h00 – 17h00",
    hoursAr: "الاثنين – الجمعة: 08:00 – 17:00",
    mapTitleFr: "Localisation du cabinet Themis Law Firm sur la carte",
    mapTitleAr: "موقع مكتب ثيميس للمحاماة على الخريطة",
    mapFallbackLabelFr: "Voir sur Google Maps",
    mapFallbackLabelAr: "عرض على خرائط جوجل",
    // Fallback external search link — does not reveal a specific address until [PLACEHOLDER] is replaced
    mapFallbackUrl: "https://www.google.com/maps/search/Tunis+Tunisie",
  },

  privacy: {
    headingFr: "Politique de confidentialité",
    headingAr: "سياسة الخصوصية",
    // [PLACEHOLDER] Replace with final text approved by the firm's legal counsel
    bodyFr: `**Politique de confidentialité — Themis Law Firm**

Le cabinet Themis Law Firm — Saadaoui & Haddad s'engage à protéger la vie privée des visiteurs de ce site.

**Données collectées**
Nous collectons uniquement les données que vous nous communiquez volontairement via le formulaire de demande de rendez-vous (nom, adresse électronique, numéro de téléphone, objet de la demande).

**Finalité du traitement**
Ces données sont utilisées exclusivement pour répondre à votre demande de consultation et organiser le rendez-vous.

**Conservation**
Vos données sont conservées le temps nécessaire au traitement de votre demande, dans le respect de la législation tunisienne applicable.

**Droits**
Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ces droits, contactez-nous à l'adresse indiquée sur la page Contact.

**Cookies**
Ce site utilise des cookies techniques nécessaires à son fonctionnement. Aucun cookie publicitaire ou de traçage n'est utilisé sans votre consentement.

*Ce texte est provisoire et doit être revu et approuvé par le cabinet avant la mise en ligne.*`,
    bodyAr: `**سياسة الخصوصية — مكتب ثيميس للمحاماة**

يلتزم مكتب ثيميس للمحاماة — سعداوي والحدّاد بحماية خصوصية زوار هذا الموقع.

**البيانات المُجمَّعة**
لا نجمع إلا البيانات التي تُرسلها طوعاً عبر نموذج طلب الموعد (الاسم، البريد الإلكتروني، رقم الهاتف، موضوع الطلب).

**الغرض من المعالجة**
تُستخدم هذه البيانات حصراً للرد على طلب استشارتك وترتيب الموعد.

**الاحتفاظ**
تُحتفظ ببياناتك طوال الوقت اللازم لمعالجة طلبك، وفق التشريع التونسي المعمول به.

**الحقوق**
يحق لك الوصول إلى بياناتك وتصحيحها وحذفها. لممارسة هذه الحقوق، تواصل معنا على العنوان المُبيَّن في صفحة الاتصال.

**ملفات تعريف الارتباط**
يستخدم هذا الموقع ملفات تعريف الارتباط التقنية الضرورية لتشغيله. لا تُستخدم ملفات تعريف ارتباط إعلانية أو تتبعية دون موافقتك.

*هذا النص مؤقت ويجب مراجعته والموافقة عليه من قِبَل المكتب قبل النشر.*`,
  },

  legal: {
    headingFr: "Mentions légales",
    headingAr: "البيانات القانونية",
    // [PLACEHOLDER] Replace with final text approved by the firm's legal counsel
    bodyFr: `**Mentions légales — Themis Law Firm**

**Éditeur du site**
Themis Law Firm — Saadaoui & Haddad
[Adresse complète — PLACEHOLDER]
[Numéro d'inscription au barreau — PLACEHOLDER]

**Hébergement**
Ce site est hébergé par un prestataire tiers. Les coordonnées de l'hébergeur seront précisées avant la mise en ligne.

**Avertissement professionnel**
Les informations figurant sur ce site ont un caractère général et informatif. Elles ne constituent pas un avis juridique et ne créent pas de relation avocat-client. Pour toute situation juridique spécifique, veuillez consulter un avocat.

**Résultats passés**
Les affaires et résultats mentionnés sur ce site sont présentés à titre illustratif uniquement. Les résultats passés ne garantissent pas de résultats similaires dans d'autres affaires.

**Propriété intellectuelle**
L'ensemble du contenu de ce site (textes, graphismes, logo) est la propriété du cabinet et est protégé par les lois applicables en matière de propriété intellectuelle.

*Ce texte est provisoire et doit être revu et approuvé par le cabinet avant la mise en ligne.*`,
    bodyAr: `**البيانات القانونية — مكتب ثيميس للمحاماة**

**ناشر الموقع**
مكتب ثيميس للمحاماة — سعداوي والحدّاد
[العنوان الكامل — مؤقت]
[رقم التسجيل في هيئة المحامين — مؤقت]

**الاستضافة**
يُستضاف هذا الموقع لدى مزوّد خدمة خارجي. ستُحدَّد بيانات مزوّد الاستضافة قبل النشر.

**تحذير مهني**
المعلومات الواردة في هذا الموقع ذات طابع عام وإعلامي. ولا تُشكّل استشارة قانونية ولا تُنشئ علاقة محامٍ-موكّل. لأي وضع قانوني محدد، يُرجى استشارة محامٍ.

**النتائج السابقة**
القضايا والنتائج المذكورة في هذا الموقع مقدَّمة على سبيل التوضيح فحسب. النتائج السابقة لا تضمن نتائج مماثلة في قضايا أخرى.

**الملكية الفكرية**
جميع محتويات هذا الموقع (نصوص، رسومات، شعار) ملك للمكتب ومحمية بموجب القوانين المعمول بها في مجال الملكية الفكرية.

*هذا النص مؤقت ويجب مراجعته والموافقة عليه من قِبَل المكتب قبل النشر.*`,
  },
};

// ---------------------------------------------------------------------------
// Legacy named export kept for backward compatibility with existing tests
// ---------------------------------------------------------------------------

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
    title: siteContent.meta.home.titleFr,
    description: siteContent.meta.home.descFr,
    navigation: [
      { href: "/fr", label: "Accueil" },
      { href: "/fr/expertises", label: "Expertises" },
      { href: "/fr/equipe", label: "Équipe" },
      { href: "/fr/rendez-vous", label: "Rendez-vous" },
      { href: "/fr/contact", label: "Contact" },
    ],
    footer: {
      address: siteContent.footer.address,
      phone: siteContent.footer.phone,
      email: siteContent.footer.email,
    },
  },
  ar: {
    title: siteContent.meta.home.titleAr,
    description: siteContent.meta.home.descAr,
    navigation: [
      { href: "/ar", label: "الصفحة الرئيسية" },
      { href: "/ar/expertise", label: "التخصصات" },
      { href: "/ar/team", label: "الفريق" },
      { href: "/ar/booking", label: "حجز موعد" },
      { href: "/ar/contact", label: "اتصل" },
    ],
    footer: {
      address: siteContent.footer.address,
      phone: siteContent.footer.phone,
      email: siteContent.footer.email,
    },
  },
};
