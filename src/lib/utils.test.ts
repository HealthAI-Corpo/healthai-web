import { describe, it, expect } from "vitest";
import {
  cn,
  formatNumber,
  formatPercent,
  formatDate,
  formatDuration,
  WORKOUT_LABELS,
  EXPERIENCE_LABELS,
  MEAL_LABELS,
} from "./utils";

// ─── cn (classnames merger) ───────────────────────────────────────────────────

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("deduplicates tailwind conflicting classes", () => {
    // tailwind-merge : p-4 écrase p-2
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});

// ─── formatNumber ─────────────────────────────────────────────────────────────

describe("formatNumber", () => {
  it("formats integer with no decimals by default", () => {
    const result = formatNumber(1234);
    // fr-FR : espace insécable comme séparateur de milliers
    expect(result.replace(/\s/g, " ")).toBe("1 234");
  });

  it("formats with specified decimals", () => {
    const result = formatNumber(3.14159, 2);
    expect(result).toBe("3,14");
  });

  it("formats zero", () => {
    expect(formatNumber(0)).toBe("0");
  });

  it("formats negative number", () => {
    const result = formatNumber(-42);
    expect(result).toBe("-42");
  });
});

// ─── formatPercent ────────────────────────────────────────────────────────────

describe("formatPercent", () => {
  it("appends percent sign", () => {
    const result = formatPercent(18.4);
    expect(result).toContain("%");
  });

  it("uses 1 decimal by default", () => {
    const result = formatPercent(18.456);
    expect(result).toContain("18,5");
  });

  it("respects custom decimals", () => {
    const result = formatPercent(50, 0);
    expect(result).toContain("50");
    expect(result).toContain("%");
  });
});

// ─── formatDate ───────────────────────────────────────────────────────────────

describe("formatDate", () => {
  it("returns a non-empty string", () => {
    const result = formatDate("2024-01-15T10:00:00Z");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("contains the year", () => {
    const result = formatDate("2024-06-01T00:00:00Z");
    expect(result).toContain("2024");
  });
});

// ─── formatDuration ───────────────────────────────────────────────────────────

describe("formatDuration", () => {
  it('returns "En cours…" when endIso is undefined', () => {
    expect(formatDuration("2024-01-01T00:00:00Z")).toBe("En cours…");
  });

  it("returns seconds for durations under 1 minute", () => {
    const start = "2024-01-01T00:00:00Z";
    const end = "2024-01-01T00:00:45Z";
    expect(formatDuration(start, end)).toBe("45s");
  });

  it("returns minutes and seconds for durations over 1 minute", () => {
    const start = "2024-01-01T00:00:00Z";
    const end = "2024-01-01T00:02:30Z";
    expect(formatDuration(start, end)).toBe("2m 30s");
  });

  it("returns 0s for identical start and end", () => {
    const iso = "2024-01-01T00:00:00Z";
    expect(formatDuration(iso, iso)).toBe("0s");
  });
});

// ─── Labels ───────────────────────────────────────────────────────────────────

describe("WORKOUT_LABELS", () => {
  it("contains expected workout types", () => {
    expect(WORKOUT_LABELS["Yoga"]).toBe("Yoga");
    expect(WORKOUT_LABELS["Cardio"]).toBe("Cardio");
    expect(WORKOUT_LABELS["HIIT"]).toBe("HIIT");
    expect(WORKOUT_LABELS["Strength"]).toBe("Musculation");
  });
});

describe("EXPERIENCE_LABELS", () => {
  it("maps numeric levels to french labels", () => {
    expect(EXPERIENCE_LABELS[1]).toBe("Débutant");
    expect(EXPERIENCE_LABELS[2]).toBe("Intermédiaire");
    expect(EXPERIENCE_LABELS[3]).toBe("Avancé");
  });
});

describe("MEAL_LABELS", () => {
  it("translates meal types to french", () => {
    expect(MEAL_LABELS["Breakfast"]).toBe("Petit-déjeuner");
    expect(MEAL_LABELS["Lunch"]).toBe("Déjeuner");
    expect(MEAL_LABELS["Dinner"]).toBe("Dîner");
    expect(MEAL_LABELS["Snack"]).toBe("Collation");
  });
});
