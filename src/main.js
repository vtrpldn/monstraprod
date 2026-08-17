import "./style.css";

const app = document.querySelector("#app");

if (!app) {
  throw new Error("App root not found");
}

const content = {
  "pt-BR": {
    title: "Monstra Prod — Produções",
    description: "Monstra Produções — contato e Grupo Flying Low.",
    eyebrow: "Produções",
    contact: "Contato",
    contactNav: "Formas de contato",
    email: "contato@monstraprod.com",
    languageLabel: "Idioma",
    flyingLowUrl: "https://grupoflyinglow.com",
    portugueseLabel: "Exibir em português do Brasil",
    englishLabel: "Show in English",
    logoAlt: "Monstra Prod",
    externalLabel: "Visitar Grupo Flying Low — abre em nova aba",
  },
  en: {
    title: "Monstra Prod — Productions",
    description: "Monstra Productions — contact and Grupo Flying Low.",
    eyebrow: "Productions",
    contact: "Contact",
    contactNav: "Contact options",
    email: "hello@monstraprod.com",
    languageLabel: "Language",
    flyingLowUrl: "https://www.grupoflyinglow.com/en",
    portugueseLabel: "Exibir em português do Brasil",
    englishLabel: "Show in English",
    logoAlt: "Monstra Prod",
    externalLabel: "Visit Grupo Flying Low — opens in a new tab",
  },
};

const pointerMotion = matchMedia(
  "(pointer: fine) and (prefers-reduced-motion: no-preference)",
);

/** @typedef {"pt-BR" | "en"} Locale */

/** @returns {Locale} */
function getInitialLocale() {
  return localStorage.getItem("monstra-locale") === "en" ? "en" : "pt-BR";
}

/** @type {Locale} */
let currentLocale = getInitialLocale();

function render() {
  const copy = content[currentLocale];
  const isPortuguese = currentLocale === "pt-BR";

  document.documentElement.lang = currentLocale;
  document.title = copy.title;
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", copy.description);

  app.innerHTML = `
    <div class="ambient" aria-hidden="true">
      <span></span>
      <span></span>
    </div>

    <section class="card" aria-labelledby="brand-name">
      <nav class="language-switcher" aria-label="${copy.languageLabel}">
        <button
          type="button"
          data-locale="pt-BR"
          lang="pt-BR"
          aria-label="${copy.portugueseLabel}"
          aria-pressed="${isPortuguese}"
        >PT</button>
        <button
          type="button"
          data-locale="en"
          lang="en"
          aria-label="${copy.englishLabel}"
          aria-pressed="${!isPortuguese}"
        >EN</button>
      </nav>

      <header class="brand">
        <p class="eyebrow">${copy.eyebrow}</p>
        <h1 id="brand-name" class="visually-hidden">Monstra Prod</h1>
        <img
          class="logo"
          src="/monstra-logo.svg"
          width="271"
          height="405"
          alt="${copy.logoAlt}"
        />
      </header>

      <div class="divider" aria-hidden="true"></div>

      <div class="contact">
        <p class="contact-label">${copy.contact}</p>
        <nav class="contact-links" aria-label="${copy.contactNav}">
          <a href="mailto:${copy.email}">
            <span class="icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M3.5 6.5h17v11h-17z" />
                <path d="m4 7 8 6 8-6" />
              </svg>
            </span>
            <span>${copy.email}</span>
            <span class="arrow" aria-hidden="true">↗</span>
          </a>

          <a
            href="${copy.flyingLowUrl}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="${copy.externalLabel}"
          >
            <span class="icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
              </svg>
            </span>
            <span>grupoflyinglow.com</span>
            <span class="arrow" aria-hidden="true">↗</span>
          </a>
        </nav>
      </div>
    </section>
  `;

  setupCardMotion();
}

function setupCardMotion() {
  const card = app.querySelector(".card");
  if (!(card instanceof HTMLElement)) {
    return;
  }

  /** @type {DOMRect | undefined} */
  let bounds;
  let frameId = 0;
  let nextRotation = 0;

  const applyRotation = () => {
    card.style.setProperty("--pointer-rotation", `${nextRotation.toFixed(3)}deg`);
    frameId = 0;
  };

  const scheduleRotation = (rotation) => {
    nextRotation = rotation;
    if (!frameId) {
      frameId = requestAnimationFrame(applyRotation);
    }
  };

  card.addEventListener("pointerenter", (event) => {
    if (pointerMotion.matches && event.pointerType === "mouse") {
      bounds = card.getBoundingClientRect();
    }
  });

  card.addEventListener("pointermove", (event) => {
    if (!pointerMotion.matches || event.pointerType !== "mouse") {
      return;
    }

    bounds ??= card.getBoundingClientRect();
    const horizontalPosition = (event.clientX - bounds.left) / bounds.width - 0.5;
    const rotation = Math.max(-1.2, Math.min(1.2, horizontalPosition * 2.4));
    scheduleRotation(rotation);
  });

  const resetRotation = () => {
    bounds = undefined;
    scheduleRotation(0);
  };

  card.addEventListener("pointerleave", resetRotation);
  card.addEventListener("pointercancel", resetRotation);
}

app.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest("button[data-locale]");
  const locale = button?.getAttribute("data-locale");
  if (locale !== "pt-BR" && locale !== "en") {
    return;
  }

  currentLocale = locale;
  localStorage.setItem("monstra-locale", locale);
  render();
  const activeButton = app.querySelector(`button[data-locale="${locale}"]`);
  if (activeButton instanceof HTMLElement) {
    activeButton.focus();
  }
});

pointerMotion.addEventListener("change", (event) => {
  if (event.matches) {
    return;
  }

  const card = app.querySelector(".card");
  if (card instanceof HTMLElement) {
    card.style.setProperty("--pointer-rotation", "0deg");
  }
});

render();
