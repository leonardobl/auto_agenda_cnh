/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Semantic palette per docs/06_UX_UI_Acessibilidade.md §4 (Design system).
      // Exact hex values are placeholders — swap for real brand colors once defined
      // (see design.md "Open Questions" in the web-app-shell change).
      colors: {
        primary: "#1d4ed8",
        success: "#15803d",
        warning: "#b45309",
        error: "#b91c1c",
      },
      // DOC-06 §4 spacing scale (4/8/12/16/24/32/48px) and border radius (8–12px) need
      // no extension: Tailwind's default rem-based scale already lands on those exact
      // values — spacing-1..12 (4/8/12/16/24/32/48px at default root font size) and
      // rounded-lg/rounded-xl (8/12px). Use those directly instead of arbitrary values.
      // DOC-06 §4 minimum touch target: 44×44px — semantic alias for spacing-11 (2.75rem),
      // which already equals 44px; the name documents *why* at each call site.
      minHeight: {
        touch: "2.75rem",
      },
      minWidth: {
        touch: "2.75rem",
      },
    },
  },
  plugins: [],
}

