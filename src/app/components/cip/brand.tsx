import { createContext, useContext } from "react";

// ── Palette ──────────────────────────────────────────────────────────
export const NAVY      = "#5a4fcf";
export const NAVY_DEEP = "#4038b5";
export const NAVY_SOFT = "#8b82e3";
export const GOLD      = "#c9a227";
export const GOLD_SOFT = "#e6c870";
export const WARM      = "#faf7f1";
export const SURFACE   = "#f4f1ea";
export const MUTED_BLUE = "#e5ebf3";
export const BORDER    = "#dcd6c8";

// ── Theme tokens ──────────────────────────────────────────────────────
export interface Theme {
  bg: string;
  cardBg: string;
  cardBorder: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  inputBg: string;
  inputBorder: string;
  rowHover: string;
  pillBg: string;
  divider: string;
  headerBg: string;
  tableHead: string;
}

export function getTheme(dark: boolean): Theme {
  if (dark) {
    return {
      bg:          "#0f172a",
      cardBg:      "#1e293b",
      cardBorder:  "#334155",
      text:        "#f1f5f9",
      textMuted:   "#94a3b8",
      textSubtle:  "#64748b",
      inputBg:     "#1e293b",
      inputBorder: "#475569",
      rowHover:    "#1e293b",
      pillBg:      "#1e3a5f",
      divider:     "#334155",
      headerBg:    "#1e293b",
      tableHead:   "#0f172a",
    };
  }
  return {
    bg:          "#f9fafb",
    cardBg:      "#ffffff",
    cardBorder:  "#e5e7eb",
    text:        NAVY,
    textMuted:   "#6b7280",
    textSubtle:  "#9ca3af",
    inputBg:     "#ffffff",
    inputBorder: "#d1d5db",
    rowHover:    "#f9fafb",
    pillBg:      "#e5ebf3",
    divider:     "#e5e7eb",
    headerBg:    "#ffffff",
    tableHead:   "#f9fafb",
  };
}

// ── Dark mode context ─────────────────────────────────────────────────
interface ThemeCtx {
  dark: boolean;
  toggle: () => void;
  theme: Theme;
}
export const ThemeContext = createContext<ThemeCtx>({
  dark: false,
  toggle: () => {},
  theme: getTheme(false),
});
export function useTheme() {
  return useContext(ThemeContext);
}

// ── Logo ──────────────────────────────────────────────────────────────
export function CiPLogo({ light = false, size = 28, className = "" }: { light?: boolean; size?: number; className?: string }) {
  // className must be forwarded — callers pass mx-auto to centre the logo
  // (dropping it left the Account Deleted logo off-centre, feedback #17).
  return (
    <img
      src="/logo.png"
      alt="CiP Logo"
      style={{ height: size, filter: light ? 'brightness(10)' : 'none' }}
      className={`object-contain ${className}`}
    />
  );
}
