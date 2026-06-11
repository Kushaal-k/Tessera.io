/**
 * Downloads the given text content as a file to the user's disk.
 *
 * @param content - The text content to download
 * @param fileName - The name of the file to save
 */
export function downloadTextFile(content: string, fileName: string): void {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}