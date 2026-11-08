/**
 * Utilitário de Imagem: Comprime e redimensiona fotos da câmera ou galeria
 * para caberem perfeitamente no armazenamento local e carregarem instantaneamente.
 */
export const comprimirImagem = (file: File, maxDim: number = 500, qualidade: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Gera base64 JPEG leve
        resolve(canvas.toDataURL('image/jpeg', qualidade));
      };
      img.onerror = () => reject(new Error('Erro ao carregar a imagem selecionada.'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo.'));
    reader.readAsDataURL(file);
  });
};

