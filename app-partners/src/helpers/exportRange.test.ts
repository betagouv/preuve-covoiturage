import { exportRangeError } from "@/helpers/exportRange";
import dayjs from "dayjs";
import { describe, expect, it } from "vitest";

const now = dayjs("2026-10-12T10:00:00");

describe("exportRangeError", () => {
  it("accepte une période valide, y compris d'un seul jour", () => {
    expect(exportRangeError(dayjs("2026-09-01"), dayjs("2026-09-30"), now)).toBeUndefined();
    expect(exportRangeError(dayjs("2026-09-01"), dayjs("2026-09-01"), now)).toBeUndefined();
  });

  it("refuse une fin avant le début", () => {
    expect(exportRangeError(dayjs("2026-09-10"), dayjs("2026-09-09"), now)).toBe(
      "La date de fin doit être postérieure à la date de début.",
    );
  });

  it("borne la fin à J-5 inclus", () => {
    expect(exportRangeError(dayjs("2026-09-01"), dayjs("2026-10-07T23:00:00"), now)).toBeUndefined();
    expect(exportRangeError(dayjs("2026-09-01"), dayjs("2026-10-08"), now)).toBe(
      "La date de fin doit être antérieure d'au moins 5 jours à aujourd'hui.",
    );
  });

  it("borne le début à 2 ans inclus", () => {
    expect(exportRangeError(dayjs("2024-10-12"), dayjs("2024-12-31"), now)).toBeUndefined();
    expect(exportRangeError(dayjs("2024-10-11"), dayjs("2024-12-31"), now)).toBe(
      "La date de début ne peut pas remonter à plus de 2 ans.",
    );
  });
});
