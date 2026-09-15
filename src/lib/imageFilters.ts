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

/**
 * Bakes a CSS filter into a video file by re-rendering every frame onto a
 * canvas (with the filter applied) and re-encoding via MediaRecorder —
 * genuine frame-level processing, not a preview trick. Takes roughly as
 * long as the video's own duration, since capture happens in real time.
 * Output is always re-encoded to WebM (VP9/Opus); Bunny's ingest accepts
 * this format directly. Returns the original file unchanged for "normal".
 */
export async function applyFilterToVideo(
  file: File,
  filterId: ImageFilterId,
  onProgress?: (fractionComplete: number) => void
): Promise<File> {
  const filter = IMAGE_FILTERS.find((f) => f.id === filterId);
  if (!filter || filter.css === "none") return file;

  const video = document.createElement("video");
  video.src = URL.createObjectURL(file);
  video.muted = true; // required for programmatic autoplay; captureStream() still includes audio
  video.playsInline = true;

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("Could not read this video file"));
  });

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.filter = filter.css;

  const canvasStream = canvas.captureStream(30);
  const sourceStream = (video as HTMLVideoElement & { captureStream?: () => MediaStream }).captureStream?.();
  const audioTracks = sourceStream?.getAudioTracks() ?? [];
  const combinedStream = new MediaStream([...canvasStream.getVideoTracks(), ...audioTracks]);

  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
    ? "video/webm;codecs=vp9,opus"
    : "video/webm";
  const recorder = new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond: 4_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const recordingDone = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
  });

  const duration = video.duration || 1;
  let rafId: number;
  function drawFrame() {
    ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);
    onProgress?.(Math.min(1, video.currentTime / duration));
    rafId = requestAnimationFrame(drawFrame);
  }

  video.onended = () => {
    cancelAnimationFrame(rafId);
    recorder.stop();
  };

  recorder.start();
  await video.play();
  drawFrame();

  const blob = await recordingDone;
  URL.revokeObjectURL(video.src);

  return new File([blob], file.name.replace(/\.\w+$/, ".webm"), { type: mimeType });
}
