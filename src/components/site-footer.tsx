import Link from "next/link";
import { catalogs, type Locale } from "@/lib/i18n/catalogs";
import { localizeView } from "@/lib/i18n/localize-view";
import SiteBrand from "@/components/site-brand";

export default function SiteFooter({ locale }: { locale: Locale }) {
  const content = (
    <footer className="site-footer">
      <div className="site-footer__content">
        <div className="site-footer__brand">
          <SiteBrand locale={locale} />
          <h2>Адрес</h2>
          <address>Orozbekova 136<br />Бишкек, Кыргызстан</address>
        </div>
        <nav className="site-footer__column site-footer__explore" aria-label="Быстрые ссылки">
          <h2>Быстрые ссылки</h2>
          <ul>
            <li><Link href="/">Главная</Link></li>
            <li><Link href="/courses">Направления</Link></li>
          </ul>
          <h3>Курсы</h3>
          <ul>
            <li><Link href="/courses/frontend">Frontend</Link></li>
            <li><Link href="/courses/backend">Backend</Link></li>
            <li><Link href="/courses/start">IT-старт</Link></li>
          </ul>
        </nav>
        <div className="site-footer__column">
          <h2>Контакты</h2>
          <h3>WhatsApp</h3>
          <ul className="site-footer__contacts">
            <li><a href="https://wa.me/996221754775" target="_blank" rel="noreferrer">+996 221 754 775</a></li>
            <li><a href="https://wa.me/996509871058" target="_blank" rel="noreferrer">+996 509 871 058</a></li>
            <li><a href="https://wa.me/996504677725" target="_blank" rel="noreferrer">+996 504 677 725</a></li>
            <li><a href="https://wa.me/996997137895" target="_blank" rel="noreferrer">+996 997 137 895</a></li>
          </ul>
        </div>
        <div className="site-footer__column site-footer__socials">
          <h2>Мы в соцсетях</h2>
          <h3>Instagram</h3>
          <ul className="site-footer__social-links">
            <li><a href="https://www.instagram.com/okurmen_it/" target="_blank" rel="noreferrer">@okurmen_it</a></li>
            <li><a href="https://www.instagram.com/okurmen.studio/" target="_blank" rel="noreferrer">@okurmen.studio</a></li>
            <li><a href="https://www.instagram.com/okurmen.jobs/" target="_blank" rel="noreferrer">@okurmen.jobs</a></li>
            <li><a href="https://www.instagram.com/okurmen_kids/" target="_blank" rel="noreferrer">@okurmen_kids</a></li>
            <li><a href="https://www.instagram.com/okurmen_kids_2/" target="_blank" rel="noreferrer">@okurmen_kids_2</a></li>
          </ul>
          <h3>Threads</h3>
          <ul className="site-footer__social-links">
            <li><a href="https://www.threads.com/@okurmen_it" target="_blank" rel="noreferrer">@okurmen_it</a></li>
            <li><a href="https://www.threads.com/@okurmen.jobs" target="_blank" rel="noreferrer">@okurmen.jobs</a></li>
          </ul>
        </div>
      </div>
      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} <span>Окурмэн айти</span></span>
        <span className="back-top-slot">
          <a href="#" className="back-top" aria-label="Наверх">
            <svg className="back-top-icon" viewBox="0 0 384 512" aria-hidden="true">
              <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
            </svg>
            <span className="back-top-label">Наверх</span>
          </a>
        </span>
      </div>
    </footer>
  );

  return localizeView(content, catalogs[locale]);
}
