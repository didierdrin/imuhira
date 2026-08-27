/** True when the value is a base64 data URL stored in Firestore. */
export function isBase64Image(src: string): boolean {
  return src.startsWith("data:image/");
}
