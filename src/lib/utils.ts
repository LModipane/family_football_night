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

export function formatDate(dateInput: Date | string | number): string {
	// Handles all input types reliably
	const date = new Date(dateInput);

	const options: Intl.DateTimeFormatOptions = {
		day: '2-digit',
		month: 'short',
		hour: '2-digit', // Changed to 2-digit for consistent "23:00" visual alignment
		minute: '2-digit',
		hourCycle: 'h23',
		timeZone: 'Africa/Johannesburg',
	};

	return new Intl.DateTimeFormat('en-GB', options).format(date);
}
