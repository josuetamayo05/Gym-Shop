import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export async function uploadProductImages(productId: string, files: File[]) {
  const urls: string[] = [];

  for (const file of files) {
    const fileRef = ref(
      storage,
      `products/${productId}/${Date.now()}-${file.name}`
    );
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    urls.push(url);
  }

  return urls;
}