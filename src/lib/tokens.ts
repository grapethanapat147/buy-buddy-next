/**
 * Typed design tokens mirroring src/styles/tokens.css (official palette, DESIGN §22).
 * Use these for JS-driven colors (charts, inline styles, confetti) so they stay in sync
 * with the CSS `@theme` values. Keep both files aligned when editing.
 */

export const tokens = {
  color: {
    primary: "#FF8A6E",
    primaryHover: "#F77C61",
    primaryPressed: "#E96D54",
    primarySoft: "#FFF0EA",
    primaryDisabled: "#FFD0C4",
    onPrimary: "#FFFFFF",

    secondary: "#FFC18B",
    accent: "#FFE1B5",

    background: "#FFF7EF",
    surface: "#FFF0E1",
    surfaceWhite: "#FFFFFF",
    surfaceHover: "#FFF8F2",
    surfaceSelected: "#FFF0EA",
    surfaceDisabled: "#F7F1EB",

    textPrimary: "#5C3A2E",
    textSecondary: "#8A6B5A",
    textMuted: "#A98F80",
    textDisabled: "#C8B8AE",
    textOnPrimary: "#FFFFFF",
    textLink: "#E96D54",

    borderDefault: "#F2DDCC",
    borderSubtle: "#F8EADF",
    borderStrong: "#DCBEAA",
    borderSelected: "#FF8A6E",
    borderFocus: "#FF8A6E",
    borderDisabled: "#E8DDD5",

    success: "#4F9B78",
    successSoft: "#EAF6EF",
    warning: "#C98A35",
    warningSoft: "#FFF4DE",
    error: "#D85C5C",
    errorSoft: "#FDECEC",
    info: "#5D87B8",
    infoSoft: "#EDF4FC",
  },
  radius: {
    small: "8px",
    medium: "12px",
    large: "16px",
    xlarge: "24px",
    "2xlarge": "32px",
    pill: "999px",
  },
  shadow: {
    small: "0 2px 8px rgba(92, 58, 46, 0.06)",
    medium: "0 8px 24px rgba(92, 58, 46, 0.10)",
    large: "0 16px 40px rgba(92, 58, 46, 0.14)",
  },
  font: {
    sans: '"LINE Seed Sans", "Sukhumvit Set", sans-serif',
  },
} as const;

export type Tokens = typeof tokens;
