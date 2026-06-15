import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { copyTextToClipboard } from "./clipboardUtils.js";

describe("copyTextToClipboard", () => {
    beforeEach(() => {
        vi.stubGlobal("navigator", {
            clipboard: {
                writeText: vi.fn(),
            },
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("calls navigator.clipboard.writeText with the provided text", async () => {
        const writeText = vi
            .spyOn(navigator.clipboard, "writeText")
            .mockResolvedValue(undefined);

        await copyTextToClipboard("const hello = 'world';");

        expect(writeText).toHaveBeenCalledOnce();
        expect(writeText).toHaveBeenCalledWith("const hello = 'world';");
    });

    it("copies an empty string without throwing", async () => {
        vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);

        await expect(copyTextToClipboard("")).resolves.toBeUndefined();
    });

    it("propagates clipboard API rejection to the caller", async () => {
        const clipboardError = new DOMException(
            "NotAllowedError",
            "Write permission denied.",
        );
        vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(clipboardError);

        await expect(copyTextToClipboard("some code")).rejects.toThrow(
            "NotAllowedError",
        );
    });
});
