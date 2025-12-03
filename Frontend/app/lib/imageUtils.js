/**
 * Compresses an image file using the Canvas API.
 * 
 * @param {File} file - The image file to compress.
 * @param {number} [maxWidth=1920] - The maximum width of the output image.
 * @param {number} [quality=0.7] - The quality of the output image (0 to 1).
 * @returns {Promise<File>} - A promise that resolves to the compressed file.
 */
export const compressImage = (file, maxWidth = 1920, quality = 0.7) => {
    return new Promise((resolve, reject) => {
        // If it's not an image, return original file
        if (!file.type.startsWith('image/')) {
            return resolve(file);
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                // Calculate new dimensions
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to blob/file
                canvas.toBlob((blob) => {
                    if (!blob) {
                        return reject(new Error('Canvas is empty'));
                    }

                    // Create new file from blob
                    const compressedFile = new File([blob], file.name, {
                        type: 'image/jpeg', // Force JPEG for better compression
                        lastModified: Date.now(),
                    });

                    // If compressed file is larger than original, return original
                    if (compressedFile.size > file.size) {
                        resolve(file);
                    } else {
                        resolve(compressedFile);
                    }
                }, 'image/jpeg', quality);
            };

            img.onerror = (error) => {
                reject(error);
            };
        };

        reader.onerror = (error) => {
            reject(error);
        };
    });
};
