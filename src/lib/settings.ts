import { useSyncExternalStore } from "react";

export const LANGUAGES = [
  { code: "en", label: "English", speech: "en-IN" },
  { code: "ta", label: "தமிழ் Tamil", speech: "ta-IN" },
  { code: "hi", label: "हिन्दी Hindi", speech: "hi-IN" },
  { code: "te", label: "తెలుగు Telugu", speech: "te-IN" },
  { code: "ml", label: "മലയാളം Malayalam", speech: "ml-IN" },
  { code: "kn", label: "ಕನ್ನಡ Kannada", speech: "kn-IN" },
] as const;
export type Lang = (typeof LANGUAGES)[number]["code"];

type S = { lang: Lang; elder: boolean };
const init: S = { lang: "en", elder: false };
let s: S = init;
const ls = new Set<() => void>();

export const settings = {
  setLang(lang: Lang) { s = { ...s, lang }; ls.forEach((l) => l()); },
  toggleElder() { s = { ...s, elder: !s.elder }; ls.forEach((l) => l()); },
};

export function useSettings() {
  return useSyncExternalStore((l) => { ls.add(l); return () => ls.delete(l); }, () => s, () => init);
}

export function speakText(text: string, lang: Lang = "en") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = LANGUAGES.find((l) => l.code === lang)!.speech;
  const v = window.speechSynthesis.getVoices().find((x) => x.lang.startsWith(lang));
  if (v) u.voice = v;
  u.rate = 0.92;
  window.speechSynthesis.speak(u);
  return true;
}
