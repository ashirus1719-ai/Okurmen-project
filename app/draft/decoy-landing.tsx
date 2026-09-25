"use client";

import { useActionState } from "react";
import { submitLead } from "../actions";
import styles from "./decoy.module.css";

const cards = [
  ["💻", "Frontend", "Делаем сайты на HTML CSS и JavaScript. Очень интересно!"],
  ["🖥️", "Backend", "Сервер, база данных и другие сложные компьютерные вещи."],
  ["🚀", "IT с нуля", "Если ничего не знаете — мы всему научим очень быстро."],
];

export default function DecoyLanding() {
  const [state, formAction, pending] = useActionState(submitLead, {
    status: "idle",
    message: "",
  });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>💡 ОКУРМЭН IT</div>
        <nav className={styles.nav} aria-label="Навигация чернового лендинга">
          <a href="#about">О НАС</a>
          <a href="#courses">КУРСЫ</a>
          <a href="#price">ЦЕНЫ</a>
          <a href="#contact">КОНТАКТЫ</a>
        </nav>
        <a className={styles.phone} href="tel:+996000000000">
          +996 000 00 00 00
        </a>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.blink}>🔥 НАБОР УЖЕ ИДЁТ!!! 🔥</div>
          <h1>СТАНЬ ПРОГРАММИСТОМ<br />ВСЕГО ЗА 3 МЕСЯЦА</h1>
          <p>Лучшие курсы айти в Кыргызстане. Обучаем с нуля до профессионала!</p>
          <a href="#contact" className={styles.heroButton}>ЗАПИСАТЬСЯ ПРЯМО СЕЙЧАС!!!</a>
          <div className={styles.computer} aria-hidden="true">🖥️⌨️🖱️</div>
        </section>

        <div className={styles.ticker}>
          ★ СКИДКА 50% ТОЛЬКО СЕГОДНЯ ★ ПЕРВЫЙ УРОК БЕСПЛАТНО ★ УСПЕЙ ЗАПИСАТЬСЯ ★
        </div>

        <section id="about" className={styles.about}>
          <h2>ПОЧЕМУ ИМЕННО МЫ?</h2>
          <div className={styles.reasons}>
            <div><b>№1</b><span>Мы лучшие</span></div>
            <div><b>100%</b><span>Практики</span></div>
            <div><b>24/7</b><span>Поддержка</span></div>
            <div><b>∞</b><span>Возможностей</span></div>
          </div>
        </section>

        <section id="courses" className={styles.courses}>
          <h2>НАШИ КУРСЫ</h2>
          <p className={styles.subtitle}>Выбери свою будущую профессию уже сегодня</p>
          <div className={styles.grid}>
            {cards.map(([icon, title, text], index) => (
              <article className={styles.card} key={title}>
                <div className={styles.icon}>{icon}</div>
                <div className={styles.badge}>ХИТ {index + 1}</div>
                <h3>{title}</h3>
                <p>{text}</p>
                <div className={styles.oldPrice}>25 000 сом</div>
                <strong>ВСЕГО 12 500 сом</strong>
                <a href="#contact">ПОДРОБНЕЕ →</a>
              </article>
            ))}
          </div>
        </section>

        <section id="price" className={styles.promise}>
          <span>🏆</span>
          <div>
            <h2>ГАРАНТИЯ УСПЕХА!</h2>
            <p>После наших курсов вы точно станете успешным программистом*</p>
            <small>* ну почти точно, всё зависит от вас</small>
          </div>
        </section>

        <section id="contact" className={styles.contact}>
          <div>
            <h2>ОСТАВЬ ЗАЯВКУ!</h2>
            <p>Наш менеджер перезвонит вам за 5 минут и всё расскажет.</p>
            <div className={styles.arrow}>➡️➡️➡️</div>
          </div>
          <form action={formAction} className={styles.form}>
            <label>Ваше имя<input name="name" minLength={2} maxLength={80} required placeholder="Введите имя" /></label>
            <label>Ваш телефон<input name="contact" required placeholder="+996..." /></label>
            <input type="hidden" name="direction" value="undecided" />
            <input type="hidden" name="format" value="undecided" />
            <label className={styles.consent}><input type="checkbox" name="consent" required /> Я согласен на обработку данных</label>
            <label className={styles.honeypot}>Сайт<input name="website" tabIndex={-1} autoComplete="off" /></label>
            <button disabled={pending}>{pending ? "ОТПРАВЛЯЕМ..." : "ХОЧУ УЧИТЬСЯ!!!"}</button>
            {state.message && <p className={state.status === "success" ? styles.success : styles.error}>{state.message}</p>}
          </form>
        </section>
      </main>

      <footer className={styles.footer}>
        <b>ОКУРМЭН IT © 2026</b>
        <span>Все права защищены!!!</span>
        <span>Сделано с ❤️ в Кыргызстане</span>
      </footer>
    </div>
  );
}
