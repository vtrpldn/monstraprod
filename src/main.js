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
    projects: "Projetos culturais",
    projectName: "Grupo Flying Low",
    languageLabel: "Idioma",
    flyingLowUrl: "https://grupoflyinglow.com",
    portugueseLabel: "Exibir em português do Brasil",
    englishLabel: "Show in English",
    logoAlt: "Monstra Prod",
    externalLabel:
      "Conheça o projeto cultural Grupo Flying Low — abre em nova aba",
  },
  en: {
    title: "Monstra Prod — Productions",
    description: "Monstra Productions — contact and Grupo Flying Low.",
    eyebrow: "Productions",
    contact: "Contact",
    contactNav: "Contact options",
    email: "hello@monstraprod.com",
    projects: "Cultural projects",
    projectName: "Grupo Flying Low",
    languageLabel: "Language",
    flyingLowUrl: "https://www.grupoflyinglow.com/en",
    portugueseLabel: "Exibir em português do Brasil",
    englishLabel: "Show in English",
    logoAlt: "Monstra Prod",
    externalLabel:
      "Explore Grupo Flying Low, a cultural project — opens in a new tab",
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

      <div class="details">
        <section class="contact" aria-labelledby="contact-heading">
          <h2 id="contact-heading" class="section-label">${copy.contact}</h2>
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
          </nav>
        </section>

        <section class="projects" aria-labelledby="projects-heading">
          <h2 id="projects-heading" class="section-label">${copy.projects}</h2>
          <a
            class="project-link"
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
            <span class="project-copy">
              <strong>${copy.projectName}</strong>
              <small>grupoflyinglow.com</small>
            </span>
            <span class="arrow" aria-hidden="true">↗</span>
          </a>
        </section>
      </div>
    </section>
  `;
}

let motionFrameId = 0;
let nextRotationX = 0;
let nextRotationY = 0;

function applyPageMotion() {
  const card = app.querySelector(".card");
  if (card instanceof HTMLElement) {
    card.style.setProperty("--pointer-rotate-x", `${nextRotationX.toFixed(3)}deg`);
    card.style.setProperty("--pointer-rotate-y", `${nextRotationY.toFixed(3)}deg`);
  }
  motionFrameId = 0;
}

function schedulePageMotion(rotationX, rotationY) {
  nextRotationX = rotationX;
  nextRotationY = rotationY;
  if (!motionFrameId) {
    motionFrameId = requestAnimationFrame(applyPageMotion);
  }
}

function resetPageMotion() {
  schedulePageMotion(0, 0);
}

function setupPageMotion() {
  window.addEventListener("pointermove", (event) => {
    if (!pointerMotion.matches || event.pointerType !== "mouse") {
      return;
    }

    const horizontalPosition = (event.clientX / window.innerWidth - 0.5) * 2;
    const verticalPosition = (event.clientY / window.innerHeight - 0.5) * 2;
    const rotationY = Math.max(-3, Math.min(3, horizontalPosition * 3));
    const rotationX = Math.max(-2.25, Math.min(2.25, verticalPosition * -2.25));
    schedulePageMotion(rotationX, rotationY);
  });

  document.documentElement.addEventListener("pointerleave", resetPageMotion);
  window.addEventListener("blur", resetPageMotion);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      resetPageMotion();
    }
  });
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
  if (!event.matches) {
    resetPageMotion();
  }
});

setupPageMotion();
render();
