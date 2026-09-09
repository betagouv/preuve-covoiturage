import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { debounce } from "./debounce";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("debounce", () => {
  test("n'appelle pas la fonction avant le délai", () => {
    const fn = vi.fn();

    debounce(fn, 300)();
    vi.advanceTimersByTime(299);

    expect(fn).not.toHaveBeenCalled();
  });

  test("appelle la fonction une fois le délai écoulé", () => {
    const fn = vi.fn();

    debounce(fn, 300)("lyon");
    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledExactlyOnceWith("lyon");
  });

  test("ne garde que le dernier appel d'une rafale", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    ["l", "ly", "lyo", "lyon"].forEach((v) => {
      debounced(v);
      vi.advanceTimersByTime(50);
    });
    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledExactlyOnceWith("lyon");
  });

  test("rappelle la fonction pour une rafale suivante", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced("lyon");
    vi.advanceTimersByTime(300);
    debounced("nantes");
    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(2);
  });
});
