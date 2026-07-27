const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

export async function uploadCloudinaryImages(productId: string, files: File[]) {
  if (!CLOUD || !PRESET) {
    throw new Error("Faltan variables VITE_CLOUDINARY_CLOUD_NAME o VITE_CLOUDINARY_UPLOAD_PRESET");
  }

  const urls: string[] = [];

  for (const file of files) {
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", PRESET);

    // carpeta opcional (sirve para mantener orden en Cloudinary)
    form.append("folder", `gym-studio/products/${productId}`);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Cloudinary upload failed: ${text}`);
    }

    const data = (await res.json()) as { secure_url?: string };
    if (data.secure_url) urls.push(data.secure_url);
  }

  return urls;
}