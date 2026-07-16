export function getGuest() {
  if (typeof window === "undefined") return "Tamu Undangan";
  return new URLSearchParams(window.location.search).get("to") || "Tamu Undangan";
}
