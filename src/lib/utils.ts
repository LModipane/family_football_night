import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function trancateName(name: string, maxLength: number = 3): string { 
  if (name.length <= maxLength) {
    return name;
  }
  return name.slice(0, maxLength)
}

export function formatDate(dateString: string): string { 
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short', // 'Dec'
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23', // Ensure 24-hour format
    timeZone: 'Africa/Johannesburg'
  };
  return new Intl.DateTimeFormat('en-GB', options).format(date);
}