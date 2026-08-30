// Source : packages/ui/src/lib/utils.ts du dépôt officiel imskyleen/animate-ui
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
