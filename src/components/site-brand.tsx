import Image from "next/image";
import Link from "next/link";
import { catalogs, type Locale } from "@/lib/i18n/catalogs";

export default function SiteBrand({ locale }: { locale: Locale }) {
  const messages = catalogs[locale];

  return (
    <Link href="/#main" className="brand" aria-label={messages["Окурмэн айти — главная"]}>
      <Image src="/logo.png" alt={messages["Окурмэн айти"]} className="brand-icon" width={43} height={43} />
      <span>
        {messages["окурмэн"]}<span className="brand-sub">{messages["айти мектеби"]}</span>
      </span>
    </Link>
  );
}