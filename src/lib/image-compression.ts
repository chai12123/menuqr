// Compress image to a max width, keeping aspect ratio and converting to WebP
export function compressImage(file: File, maxWidth = 800): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          resolve(file); // no need to compress if smaller
          return;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
             resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
               type: "image/webp",
               lastModified: Date.now(),
             }));
          } else {
             reject(new Error("Canvas to Blob failed"));
          }
        }, "image/webp", 0.8);
      };
      img.onerror = () => reject(new Error("Image load failed"));
    };
    reader.onerror = (error) => reject(error);
  });
}
