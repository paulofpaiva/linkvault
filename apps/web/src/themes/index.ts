export type ThemeName = 'light' | 'dark' | 'blue' | 'beige' | 'green' | 'purple';

export interface ThemeDescriptor {
  name: ThemeName;
  label: string;
  swatches: [string, string, string];
  bgPreview: string;
}

export const AVAILABLE_THEMES: ThemeDescriptor[] = [
  { name: 'light', label: 'Light', swatches: ['bg-red-400', 'bg-yellow-400', 'bg-green-400'], bgPreview: 'bg-white' },
  { name: 'dark', label: 'Dark', swatches: ['bg-red-500', 'bg-yellow-500', 'bg-green-500'], bgPreview: 'bg-zinc-900' },
  { name: 'blue', label: 'Blue', swatches: ['bg-sky-500', 'bg-sky-600', 'bg-sky-700'], bgPreview: 'bg-sky-100' },
  { name: 'beige', label: 'Beige', swatches: ['bg-amber-200', 'bg-amber-300', 'bg-amber-400'], bgPreview: 'bg-amber-50' },
  { name: 'green', label: 'Green', swatches: ['bg-emerald-400', 'bg-emerald-500', 'bg-emerald-600'], bgPreview: 'bg-emerald-50' },
  { name: 'purple', label: 'Purple', swatches: ['bg-violet-400', 'bg-violet-500', 'bg-violet-600'], bgPreview: 'bg-violet-50' },
];

export const THEME_NAME_SET = new Set<ThemeName>(AVAILABLE_THEMES.map(t => t.name));


