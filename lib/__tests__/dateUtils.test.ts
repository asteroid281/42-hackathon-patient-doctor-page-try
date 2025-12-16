import {
  toISODate,
  addDays,
  isWeekendISO,
  isPastISO,
  minutesUntil,
} from "../dateUtils";

describe("Date Utilities", () => {
  describe("toISODate", () => {
    it("should convert Date to ISO format (YYYY-MM-DD)", () => {
      const date = new Date(2025, 11, 17); // December 17, 2025
      const result = toISODate(date);
      expect(result).toBe("2025-12-17");
    });

    it("should pad single digit months and days", () => {
      const date = new Date(2025, 0, 5); // January 5, 2025
      const result = toISODate(date);
      expect(result).toBe("2025-01-05");
    });
  });

  describe("addDays", () => {
    it("should add days to ISO date", () => {
      const result = addDays("2025-12-17", 1);
      expect(result).toBe("2025-12-18");
    });

    it("should handle month transitions", () => {
      const result = addDays("2025-12-31", 1);
      expect(result).toBe("2026-01-01");
    });

    it("should handle negative delta (subtract days)", () => {
      const result = addDays("2025-12-17", -1);
      expect(result).toBe("2025-12-16");
    });
  });

  describe("isWeekendISO", () => {
    it("should return true for Saturday", () => {
      // December 20, 2025 is Saturday
      const result = isWeekendISO("2025-12-20");
      expect(result).toBe(true);
    });

    it("should return true for Sunday", () => {
      // December 21, 2025 is Sunday
      const result = isWeekendISO("2025-12-21");
      expect(result).toBe(true);
    });

    it("should return false for weekday", () => {
      // December 17, 2025 is Wednesday
      const result = isWeekendISO("2025-12-17");
      expect(result).toBe(false);
    });
  });

  describe("isPastISO", () => {
    it("should return true if date is before today", () => {
      const result = isPastISO("2025-01-01", "2025-12-17");
      expect(result).toBe(true);
    });

    it("should return false if date is today or future", () => {
      const result = isPastISO("2025-12-17", "2025-12-17");
      expect(result).toBe(false);
    });

    it("should return false if date is in future", () => {
      const result = isPastISO("2026-01-01", "2025-12-17");
      expect(result).toBe(false);
    });
  });

  describe("minutesUntil", () => {
    it("should calculate minutes until specific time", () => {
      // This test should use mocked Date.now()
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-12-17T14:00:00Z"));

      const result = minutesUntil("2025-12-17", "14:30");
      expect(result).toBeGreaterThanOrEqual(29);
      expect(result).toBeLessThanOrEqual(31);

      jest.useRealTimers();
    });
  });
});
