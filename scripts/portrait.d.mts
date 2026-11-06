export type CropBox = { left: number; top: number; width: number; height: number };

export const PHOTO_CANDIDATES: string[];
export function findPhoto(root?: string): string | undefined;
export function buildPortraits(o: {
  src: string;
  crop?: 'auto' | CropBox;
  outDir?: string;
  title?: string;
  subtitle?: string;
}): Promise<CropBox>;
