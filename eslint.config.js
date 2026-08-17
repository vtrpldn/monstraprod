import js from "@eslint/js";

export default [
  {
    ignores: ["dist/**"],
  },
  {
    ...js.configs.recommended,
    languageOptions: {
      globals: {
        document: "readonly",
        Element: "readonly",
        HTMLElement: "readonly",
        localStorage: "readonly",
      },
    },
  },
];
