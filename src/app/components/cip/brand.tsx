import { createContext, useContext } from "react";

// ── Palette ──────────────────────────────────────────────────────────
export const NAVY      = "#0b2545";
export const NAVY_DEEP = "#08203d";
export const NAVY_SOFT = "#13386b";
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
export function CiPLogo({ light = false, size = 28 }: { light?: boolean; size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-md flex items-center justify-center"
        style={{ width: size, height: size, background: light ? "rgba(255,255,255,0.15)" : NAVY }}
      >
        <span style={{ color: light ? GOLD : GOLD, fontWeight: 700, fontSize: size * 0.48 }}>✚</span>
      </div>
      <div className="flex flex-col leading-tight">
        <span style={{ color: light ? "#fff" : NAVY, fontWeight: 700, letterSpacing: "0.04em", fontSize: 14 }}>
          CiP
        </span>
        <span style={{ color: light ? "rgba(255,255,255,0.55)" : "#9ca3af", fontSize: 9, letterSpacing: "0.1em" }}>
          CHRISTIANS IN POLITICS
        </span>
      </div>
    </div>
  );
}
