import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFileName(path: string): string {
  return path.split('/').pop() || path.split('\\').pop() || path;
}

export function removeExtension(path: string): string {
  return path.replace(/\.[^.]+$/, '');
}

export function changeExtension(path: string, ext: string): string {
  return removeExtension(path) + ext;
}
