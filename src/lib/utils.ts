
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the appropriate label and styles for breach status
 */
export function getBreachStatusDisplay(isBreached: boolean) {
  return {
    label: isBreached ? "SLA Breached" : "In SLA",
    className: isBreached ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
  }
}

