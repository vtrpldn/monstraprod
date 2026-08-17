import "./style.css";

const app = document.querySelector("#app");

if (!app) {
  throw new Error("App root not found");
}

app.innerHTML = `
  <div class="ambient" aria-hidden="true">
    <span></span>
    <span></span>
  </div>

  <section class="card" aria-labelledby="brand-name">
    <header class="brand">
      <p class="eyebrow">Produções <span>/</span> Productions</p>
      <h1 id="brand-name" aria-label="Monstra Prod">
        <span>Mon</span>
        <span>stra</span>
      </h1>
      <p class="brand-foot">Prod <span>© 2026</span></p>
    </header>

    <div class="divider" aria-hidden="true"></div>

    <div class="contact">
      <p class="contact-label">Contato <span>/</span> Contact</p>
      <nav aria-label="Contato">
        <a href="mailto:contato@monstraprod.com">
          <span class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M3.5 6.5h17v11h-17z" />
              <path d="m4 7 8 6 8-6" />
            </svg>
          </span>
          <span>contato@monstraprod.com</span>
          <span class="arrow" aria-hidden="true">↗</span>
        </a>

        <a href="mailto:hello@monstraprod.com">
          <span class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M3.5 6.5h17v11h-17z" />
              <path d="m4 7 8 6 8-6" />
            </svg>
          </span>
          <span>hello@monstraprod.com</span>
          <span class="arrow" aria-hidden="true">↗</span>
        </a>

        <a
          href="https://grupoflyinglow.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visitar Grupo Flying Low — abre em nova aba"
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
