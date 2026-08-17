import "./style.css";

const app = document.querySelector("#app");

if (!app) {
  throw new Error("App root not found");
}

app.innerHTML = `
  <a href="mailto:contato@monstraprod.com">contato@monstraprod.com</a>
  <a href="mailto:hello@monstraprod.com">hello@monstraprod.com</a>
`;
