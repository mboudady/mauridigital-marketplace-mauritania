export const IMAGE_FILTERS = [
  { id: "normal", label: "Normal", css: "none" },
  { id: "vivid", label: "Vivid", css: "saturate(1.5) contrast(1.15)" },
  { id: "bw", label: "B&W", css: "grayscale(1) contrast(1.1)" },
  { id: "warm", label: "Warm", css: "sepia(0.25) saturate(1.3) brightness(1.05)" },
  { id: "fade", label: "Fade", css: "contrast(0.85) brightness(1.1) saturate(0.85)" },
] as const;

export type ImageFilterId = (typeof IMAGE_FILTERS)[number]["id"];

/** Bakes a CSS filter into an image file via canvas, returning a new File.
 * Returns the original file unchanged if the filter is "normal". */
export async function applyFilterToImage(file: File, filterId: ImageFilterId): Promise<File> {
  const filter = IMAGE_FILTERS.find((f) => f.id === filterId);
  if (!filter || filter.css === "none") return file;

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.filter = filter.css;
  ctx.drawImage(bitmap, 0, 0);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, file.type || "image/jpeg", 0.92)
  );
  if (!blob) return file;

  return new File([blob], file.name, { type: file.type || "image/jpeg" });
}
