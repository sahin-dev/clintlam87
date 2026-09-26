import { PDFDocument } from 'pdf-lib';

/** Upload limits for a construction plan set. */
export const MAX_FILE_MB = 250;
export const MAX_FILES = 40;

/** Everything an estimator realistically hands to a takeoff. */
export const ACCEPT_ATTR =
'.pdf,.dwg,.dxf,.png,.jpg,.jpeg,.tif,.tiff,.webp,application/pdf,image/png,image/jpeg,image/tiff,image/webp';

export type DrawingKind = 'pdf' | 'cad' | 'image';

const EXT_KIND: Record<string, DrawingKind> = {
  pdf: 'pdf',
  dwg: 'cad',
  dxf: 'cad',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  tif: 'image',
  tiff: 'image',
  webp: 'image'
};

export function extensionOf(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

export function kindOf(name: string): DrawingKind | null {
  return EXT_KIND[extensionOf(name)] ?? null;
}

export function toMb(bytes: number): number {
  return bytes / (1024 * 1024);
}

export function formatMb(value: number): string {
  if (value < 0.1) return '<0.1 MB';
  return value >= 10 ? `${Math.round(value)} MB` : `${value.toFixed(1)} MB`;
}

export interface Inspection {
  /** Sheets this file contributes to the plan set. */
  sheets: number;
  previewUrl?: string;
  dimensions?: string;
  /** Blocks the file from being uploaded. */
  error?: string;
  /** Uploads fine, but the AI result may suffer. */
  warning?: string;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('unreadable'));
    img.src = url;
  });
}

/**
 * Reads the file in the browser to establish what the takeoff will actually
 * receive: how many sheets it contains, whether it can be opened at all, and
 * whether the resolution is high enough for the model to read dimension text.
 */
export async function inspectDrawing(file: File): Promise<Inspection> {
  const kind = kindOf(file.name);

  if (!kind) {
    return { sheets: 0, error: 'Unsupported file type. Use PDF, DWG, DXF or an image.' };
  }
  if (toMb(file.size) > MAX_FILE_MB) {
    return { sheets: 0, error: `Larger than the ${MAX_FILE_MB} MB limit. Split the set and upload in parts.` };
  }
  if (file.size === 0) {
    return { sheets: 0, error: 'This file is empty.' };
  }

  if (kind === 'pdf') {
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { updateMetadata: false });
      const sheets = doc.getPageCount();
      if (sheets === 0) return { sheets: 0, error: 'This PDF contains no pages.' };
      return { sheets };
    } catch (e) {
      const message = e instanceof Error ? e.message : '';
      if (/encrypt/i.test(message)) {
        return {
          sheets: 0,
          error: 'Password-protected PDF. Remove protection, then upload it again.'
        };
      }
      return { sheets: 0, error: 'This PDF could not be read — it may be damaged.' };
    }
  }

  if (kind === 'cad') {
    return {
      sheets: 1,
      warning: 'CAD files are rasterized during processing, which can take longer.'
    };
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const shortEdge = Math.min(img.naturalWidth, img.naturalHeight);
    return {
      sheets: 1,
      previewUrl: url,
      dimensions: `${img.naturalWidth} × ${img.naturalHeight}`,
      warning:
      shortEdge < 1200 ?
      'Low resolution — the AI may miss dimension text. Re-scan at 300 dpi or higher.' :
      undefined
    };
  } catch {
    URL.revokeObjectURL(url);
    return { sheets: 0, error: 'This image could not be opened.' };
  }
}