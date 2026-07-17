import Image from "next/image";

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/brand/themis-logo-dark.png"
        alt="Themis Law Firm"
        width={140}
        height={40}
        className="h-10 w-auto"
        style={{ width: "auto" }}
      />
      <span className="text-sm font-semibold uppercase tracking-[0.24em] text-navy">Themis Law Firm</span>
    </div>
  );
}
