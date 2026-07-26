/**
 * Copies the given text to the system clipboard using the
 * Clipboard API.  Callers should handle the returned Promise so
 * that permission-denied or insecure-context errors (browser
 * blocks clipboard in non-HTTPS / non-localhost contexts) are
 * surfaced gracefully.
 *
 * @param text - The text content to copy to the clipboard
 */
export async function copyTextToClipboard(text: string): Promise<void> {
    await navigator.clipboard.writeText(text);
}
