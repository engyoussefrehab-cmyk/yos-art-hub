// Prepares uploaded images in the browser before they are committed:
// photos become high-quality WebP (max 2560px wide, quality 0.9) plus a JPEG
// twin under /media/share/ for social previews. SVG, GIF and PDF are kept as-is.

export type PreparedUpload = {
  /** Site URL the content will reference, e.g. /media/uploads/2026/10/qutoof-a1b2.webp */
  url: string;
  files: { path: string; bytes: Uint8Array }[];
  /** Local preview until the site is rebuilt. */
  previewUrl: string;
  width?: number;
  height?: number;
  bytes: number;
};

const MAX_W = 2560;
const SHARE_W = 1200;

function slugify(name: string) {
  const base = name.replace(/\.[^.]+$/, "").toLowerCase();
  const s = base.replace(/[^a-z0-9؀-ۿ]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  return s || "image";
}

function stamp() {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function rand() {
  return Math.random().toString(36).slice(2, 7);
}

async function loadBitmap(file: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fall through */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function encode(src: ImageBitmap | HTMLImageElement, maxW: number, type: string, quality: number) {
  const w0 = "naturalWidth" in src ? src.naturalWidth : src.width;
  const h0 = "naturalHeight" in src ? src.naturalHeight : src.height;
  const w = Math.min(w0, maxW);
  const h = Math.round((h0 * w) / w0);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if (type === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(src, 0, 0, w, h);
  const blob: Blob = await new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode failed"))), type, quality),
  );
  return { bytes: new Uint8Array(await blob.arrayBuffer()), w, h, blob };
}

export async function prepareUpload(file: File, folder = "uploads", options?: { preserveOriginal?: boolean }): Promise<PreparedUpload> {
  const name = `${slugify(file.name)}-${rand()}`;
  const dir = `${folder}/${stamp()}`;
  const passthrough = /svg|gif|pdf/.test(file.type) || /\.(svg|gif|pdf)$/i.test(file.name);
  if (passthrough) {
    const ext = (file.name.match(/\.([a-z0-9]+)$/i)?.[1] || "bin").toLowerCase();
    const bytes = new Uint8Array(await file.arrayBuffer());
    return {
      url: `/media/${dir}/${name}.${ext}`,
      files: [{ path: `public/media/${dir}/${name}.${ext}`, bytes }],
      previewUrl: URL.createObjectURL(file),
      bytes: bytes.length,
    };
  }
  if (options?.preserveOriginal && ["image/png", "image/jpeg", "image/webp", "image/avif"].includes(file.type.toLowerCase())) {
    const ext = file.type.toLowerCase() === "image/jpeg" ? "jpg" : file.type.split("/")[1].toLowerCase();
    const bytes = new Uint8Array(await file.arrayBuffer());
    return {
      url: `/media/${dir}/${name}.${ext}`,
      files: [{ path: `public/media/${dir}/${name}.${ext}`, bytes }],
      previewUrl: URL.createObjectURL(file),
      bytes: bytes.length,
    };
  }
  const bmp = await loadBitmap(file);
  const main = await encode(bmp, MAX_W, "image/webp", 0.9);
  const share = await encode(bmp, SHARE_W, "image/jpeg", 0.86);
  return {
    url: `/media/${dir}/${name}.webp`,
    files: [
      { path: `public/media/${dir}/${name}.webp`, bytes: main.bytes },
      { path: `public/media/share/${dir}/${name}.jpg`, bytes: share.bytes },
    ],
    previewUrl: URL.createObjectURL(main.blob),
    width: main.w,
    height: main.h,
    bytes: main.bytes.length,
  };
}
