/**
 * Redimensiona y comprime una imagen a JPEG data URL (adecuado para enviar al API).
 */
export function compressImageFileToJpegDataUrl(file, maxEdge = 960, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith('image/')) {
      reject(new Error('Elige un archivo de imagen (JPG, PNG, etc.).'))
      return
    }
    if (file.size > 12 * 1024 * 1024) {
      reject(new Error('La imagen es demasiado grande (máx. 12 MB).'))
      return
    }
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > maxEdge || height > maxEdge) {
        const scale = maxEdge / Math.max(width, height)
        width = Math.round(width * scale)
        height = Math.round(height * scale)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas no disponible'))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo leer la imagen.'))
    }
    img.src = url
  })
}
