import "./style.css";

const app = document.querySelector("#app");

if (!app) {
  throw new Error("App root not found");
}

const content = {
  "pt-BR": {
    title: "Monstra Prod — Produções Culturais",
    description:
      "Monstra Prod é uma produtora cultural responsável pelo projeto Grupo Flying Low. Entre em contato.",
    eyebrow: "Produções",
    contact: "Contato",
    contactNav: "Formas de contato",
    email: "contato@monstraprod.com",
    projectName: "Grupo Flying Low",
    flyingLowUrl: "https://grupoflyinglow.com",
    flipText: "English",
    flipArrow: "→",
    flipLabel: "Show the English side",
    logoAlt: "Monstra Prod",
    externalLabel:
      "Conheça Grupo Flying Low, projeto em destaque da Monstra — abre em nova aba",
  },
  en: {
    title: "Monstra Prod — Cultural Productions",
    description:
      "Monstra Prod is a cultural production company behind the Grupo Flying Low project. Get in touch.",
    eyebrow: "Productions",
    contact: "Contact",
    contactNav: "Contact options",
    email: "hello@monstraprod.com",
    projectName: "Grupo Flying Low",
    flyingLowUrl: "https://www.grupoflyinglow.com/en",
    flipText: "Português",
    flipArrow: "←",
    flipLabel: "Mostrar o lado em português",
    logoAlt: "Monstra Prod",
    externalLabel:
      "Explore Grupo Flying Low, a featured Monstra project — opens in a new tab",
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

/** @param {Locale} locale */
function updateDocumentMetadata(locale) {
  const copy = content[locale];
  document.documentElement.lang = locale;
  document.title = copy.title;
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", copy.description);
}

/**
 * @param {Locale} locale
 * @param {"front" | "back"} side
 */
function renderFace(locale, side) {
  const copy = content[locale];
  const isPortuguese = locale === "pt-BR";
  const targetLocale = isPortuguese ? "en" : "pt-BR";
  const targetId = isPortuguese ? "english" : "portugues";
  const isActive = locale === currentLocale;

  return `
    <div
      id="${isPortuguese ? "portugues" : "english"}"
      class="card-face card-face--${side}"
      data-face-locale="${locale}"
      aria-hidden="${!isActive}"
      ${isActive ? "" : "inert"}
    >
      <a
        class="language-link"
        href="#${targetId}"
        data-locale="${targetLocale}"
        lang="${targetLocale}"
        hreflang="${targetLocale}"
        aria-label="${copy.flipLabel}"
      >
        <span>${copy.flipText}</span>
        <span class="language-arrow" aria-hidden="true">${copy.flipArrow}</span>
      </a>

      <header class="brand">
        <p class="eyebrow">${copy.eyebrow}</p>
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
        <div class="featured-project">
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
        </div>

        <section class="contact" aria-labelledby="contact-heading-${side}">
          <h2 id="contact-heading-${side}" class="section-label">${copy.contact}</h2>
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
      </div>
    </div>
  `;
}

function render() {
  updateDocumentMetadata(currentLocale);

  app.innerHTML = `
    <div class="ambient" aria-hidden="true">
      <span></span>
      <span></span>
    </div>

    <section class="card-shell" aria-labelledby="brand-name">
      <h1 id="brand-name" class="visually-hidden">Monstra Prod</h1>
      <div class="card ${currentLocale === "en" ? "is-flipped" : ""}">
        ${renderFace("pt-BR", "front")}
        ${renderFace("en", "back")}
      </div>
    </section>
  `;
}

let motionFrameId = 0;
let nextRotationX = 0;
let nextRotationY = 0;

function applyPageMotion() {
  const card = app.querySelector(".card-shell");
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

let focusTimerId = 0;

/**
 * @param {Locale} locale
 * @param {boolean} moveFocus
 */
function showLocale(locale, moveFocus = false) {
  const card = app.querySelector(".card");
  if (!(card instanceof HTMLElement)) {
    return;
  }

  currentLocale = locale;
  localStorage.setItem("monstra-locale", locale);
  updateDocumentMetadata(locale);
  card.classList.toggle("is-flipped", locale === "en");

  for (const face of app.querySelectorAll("[data-face-locale]")) {
    const isActive = face.getAttribute("data-face-locale") === locale;
    face.setAttribute("aria-hidden", String(!isActive));
    face.toggleAttribute("inert", !isActive);
  }

  if (moveFocus) {
    window.clearTimeout(focusTimerId);
    focusTimerId = window.setTimeout(() => {
      const activeFace = app.querySelector(`[data-face-locale="${locale}"]`);
      const languageLink = activeFace?.querySelector(".language-link");
      if (languageLink instanceof HTMLElement) {
        languageLink.focus();
      }
    }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650);
  }
}

app.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const link = event.target.closest("a.language-link[data-locale]");
  const locale = link?.getAttribute("data-locale");
  if (locale !== "pt-BR" && locale !== "en") {
    return;
  }

  event.preventDefault();
  const wasKeyboardActivated = "detail" in event && event.detail === 0;
  showLocale(locale, wasKeyboardActivated);
});

pointerMotion.addEventListener("change", (event) => {
  if (!event.matches) {
    resetPageMotion();
  }
});

setupPageMotion();
render();
