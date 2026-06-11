export type AppTarget = "web" | "mobile";

export const APP_TARGET: AppTarget =
  process.env.NEXT_PUBLIC_APP_TARGET === "mobile" ? "mobile" : "web";

export function isMobileAppTarget(): boolean {
  return APP_TARGET === "mobile";
}
