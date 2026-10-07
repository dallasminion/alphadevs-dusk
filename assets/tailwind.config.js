// Design tokens from DESIGN.md (Dimension), mapped under real names so no screen hard-codes a hex.
// Loaded after the Tailwind Play CDN script on every page.
tailwind.config = {
  darkMode: "class",
  // Preflight is injected after theme.css loads and would reset the heading and button styles
  // defined there, so the reset lives in theme.css instead.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        canvas: "#0a0a0a",      // Void Canvas — surface 0
        graphite: "#161616",    // Graphite — surface 1
        frost: "#d4d4d4",       // Frosted Glass — surface 2, always used at /10
        ink: "#000000",         // Ink Black
        snow: "#ffffff",        // Snow White — surface 3, the inverted surface
        bone: "#ededed",        // primary text on dark
        ash: "#c2c2c2",         // secondary text
        slate: "#686868",       // muted text
        smoke: "#b2b2b2",       // idle / disabled text
        hairline: "#e5e5e5",    // 1px borders, used at /15
        violet: "#6b62f2",      // gradient wash only, never a fill
        // Three semantic tones for status dots and error text only. Never a control fill.
        ok: "#7fbf8f",
        wait: "#d9b36b",
        bad: "#e07a7a",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      fontSize: {
        caption: ["13px", { lineHeight: "1.5", letterSpacing: "0.33px" }],
        body: ["16px", { lineHeight: "1.5" }],
        sub: ["18px", { lineHeight: "1.5" }],
        "h-sm": ["24px", { lineHeight: "1.33", letterSpacing: "-0.01em" }],
        h: ["36px", { lineHeight: "1.11", letterSpacing: "-0.02em" }],
        "h-lg": ["48px", { lineHeight: "1", letterSpacing: "-0.03em" }],
        display: ["72px", { lineHeight: "1", letterSpacing: "-2.52px" }],
      },
      borderRadius: {
        icon: "4px",
        ui: "10px",
        nav: "19px",
        card: "24px",
        large: "40px",
        panel: "42px",
        pill: "9999px",
      },
      boxShadow: {
        subtle: "rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset",
        nav: "rgba(255,255,255,0.02) 0px 3px 4.5px, rgba(0,0,0,0.04) 0px 10px 8px, rgba(0,0,0,0.1) 0px 4px 3px",
      },
      backgroundImage: {
        horizon: "linear-gradient(100deg, #e0875a 0%, #c86a6a 35%, #5d5bd6 70%, #2f4fd6 100%)",
        wash: "linear-gradient(90deg, rgba(0,0,0,0), rgba(0,0,0,0) 40%, rgba(107,98,242,0.565) 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0))",
        spotlight: "radial-gradient(circle at center, rgba(107,98,242,0.55) 0%, rgba(107,98,242,0) 70%)",
      },
      maxWidth: { page: "1200px" },
      transitionTimingFunction: {
        out: "cubic-bezier(0.23, 1, 0.32, 1)",
        drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
    },
  },
};
