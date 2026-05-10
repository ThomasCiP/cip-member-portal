export const NAVY = "#0b2545";
export const NAVY_DEEP = "#08203d";
export const NAVY_SOFT = "#13386b";
export const GOLD = "#c9a227";
export const GOLD_SOFT = "#e6c870";
export const WARM = "#faf7f1";
export const SURFACE = "#f4f1ea";
export const MUTED_BLUE = "#e5ebf3";
export const BORDER = "#dcd6c8";

export function CiPLogo({ light = false, size = 28 }: { light?: boolean; size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-md flex items-center justify-center"
        style={{ width: size, height: size, background: light ? "#fff" : NAVY }}
      >
        <span style={{ color: light ? NAVY : GOLD, fontWeight: 600, fontSize: size * 0.5 }}>
          ✚
        </span>
      </div>
      <div className="flex flex-col leading-tight">
        <span style={{ color: light ? "#fff" : NAVY, fontWeight: 600, letterSpacing: "0.02em" }}>
          CiP
        </span>
        <span
          style={{ color: light ? "rgba(255,255,255,0.7)" : "#6b7280", fontSize: 10, letterSpacing: "0.08em" }}
        >
          CHRISTIANS IN POLITICS
        </span>
      </div>
    </div>
  );
}
