/**
 * Descarga un Blob como un archivo en el navegador del cliente.
 * @param {Blob} blob - Archivo binario recibido del servidor
 * @param {string} filename - Nombre con el que se guardará el archivo descargado
 */
export function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
