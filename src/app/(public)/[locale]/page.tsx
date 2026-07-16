import { localeContent } from "@/lib/content";
import { isSupportedLocale } from "@/lib/locale";
import { notFound } from "next/navigation";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return [
    { locale: "fr" },
    { locale: "ar" },
  ];
}

export default async function PublicHomePage({ params }: LocalePageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return notFound();
  }

  const content = localeContent[locale];

  return (
    <section className="container py-20">
      <h1 className="page-heading text-4xl font-semibold text-navy">
        {locale === "fr" ? "Bienvenue chez Themis Law Firm" : "مرحباً بكم في مكتب ثيميس"}
      </h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">{content.description}</p>
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <article className="rounded-3xl border border-silver/30 bg-surface p-8">
          <h2 className="text-xl font-semibold text-black">
            {locale === "fr" ? "Notre cabinet" : "عن المكتب"}
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            {locale === "fr"
              ? "Une présence institutionnelle premium en français et en arabe, avec une future gestion interne des rendez-vous."
              : "حضور مؤسسي راقٍ باللغتين الفرنسية والعربية، مع نظام داخلي مستقبلي للمواعيد."}
          </p>
        </article>
        <article className="rounded-3xl border border-silver/30 bg-surface p-8">
          <h2 className="text-xl font-semibold text-black">
            {locale === "fr" ? "Navigation" : "التنقل"}
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-muted">
            {content.navigation.map((item) => (
              <li key={item.href}>{item.label}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
