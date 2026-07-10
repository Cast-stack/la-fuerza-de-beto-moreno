import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Returns the URL only if it is a safe http(s) link, otherwise undefined.
// Guards against `javascript:`, `data:`, and other scheme-based injection
// when rendering URLs that originate from the database into href / src /
// window.open. React does NOT block `javascript:` URLs in href on its own.
export function safeExternalUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url, "https://placeholder.invalid");
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? url : undefined;
  } catch {
    return undefined;
  }
}
