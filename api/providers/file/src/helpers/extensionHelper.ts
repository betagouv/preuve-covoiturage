export function extensionHelper(contentType: string): string | null {
  switch (contentType) {
    case 'image/bmp':
      return 'bmp';
    case 'image/jpg':
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/svg+xml':
      return 'svg';
    case 'image/tiff':
    case 'image/tiff-fx':
      return 'tiff';
    case 'image/vnd.adobe.photoshop':
      return 'psd';
    default:
      return null;
  }
}
