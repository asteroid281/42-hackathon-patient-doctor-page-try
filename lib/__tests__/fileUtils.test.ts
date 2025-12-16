import { formatBytes } from "../fileUtils";

describe("File Utilities", () => {
  describe("formatBytes", () => {
    it("should format bytes", () => {
      expect(formatBytes(512)).toBe("512 B");
    });

    it("should format kilobytes", () => {
      expect(formatBytes(1024)).toBe("1.0 KB");
      expect(formatBytes(2048)).toBe("2.0 KB");
    });

    it("should format megabytes", () => {
      expect(formatBytes(1024 * 1024)).toBe("1.00 MB");
      expect(formatBytes(2.5 * 1024 * 1024)).toBe("2.50 MB");
    });

    it("should handle zero bytes", () => {
      expect(formatBytes(0)).toBe("0 B");
    });
  });
});
