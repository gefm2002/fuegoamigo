type CompressOptions = {
  maxWidth: number;
  maxHeight: number;
  targetBytes: number;
  mimeType?: 'image/webp';
  quality?: number;
  minQuality?: number;
};

async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('No se pudo leer la imagen'));
    });
    return img;
  } finally {
    // Revoke in a microtask so the image has time
    queueMicrotask(() => URL.revokeObjectURL(url));
  }
}

function drawToCanvas(img: HTMLImageElement, maxWidth: number, maxHeight: number): HTMLCanvasElement {
  const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
  const w = Math.max(1, Math.round(img.width * ratio));
  const h = Math.max(1, Math.round(img.height * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo crear canvas');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

async function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mimeType, quality));
  if (!blob) throw new Error('No se pudo convertir la imagen');
  return blob;
}

export async function compressImageToWebp(
  file: File,
  opts: CompressOptions
): Promise<{ blob: Blob; contentType: string; filename: string }> {
  const {
    maxWidth,
    maxHeight,
    targetBytes,
    mimeType = 'image/webp',
    quality = 0.82,
    minQuality = 0.55,
  } = opts;

  const img = await loadImageFromFile(file);
  const canvas = drawToCanvas(img, maxWidth, maxHeight);

  let q = quality;
  let blob = await canvasToBlob(canvas, mimeType, q);

  while (blob.size > targetBytes && q > minQuality) {
    q = Math.max(minQuality, q - 0.08);
    blob = await canvasToBlob(canvas, mimeType, q);
  }

  const base = file.name.replace(/\.[^/.]+$/, '');
  return { blob, contentType: mimeType, filename: `${base}.webp` };
}

