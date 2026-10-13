import { describe, expect, test } from "vitest";
import { classColor, classWidth, getLegendClasses, jenks } from "./analyse";
import type { AnalyseInterface } from "@/interfaces/observatoire/helpersInterfaces";

const classes: AnalyseInterface[] = [
  { val: 1, max: 9, color: [1, 1, 1], width: 1 },
  { val: 10, max: 29, color: [2, 2, 2], width: 2 },
  { val: 30, max: 1250, color: [3, 3, 3], width: 3 },
];

describe("jenks", () => {
  test("garde les bornes réelles de chaque classe", () => {
    const data = [1, 2, 3, 50, 60, 70, 900, 1000].map((count) => ({ count }));
    const analyse = jenks(data, "count", ["#000001", "#000002", "#000003"], [1, 1, 1]);
    expect(analyse.map((c) => [c.val, c.max])).toEqual([[1, 3], [50, 70], [900, 1000]]);
  });
});

describe("classColor / classWidth", () => {
  test("prend la classe qui contient la valeur, pas le seuil le plus proche", () => {
    expect(classColor(24, classes)).toEqual([2, 2, 2]);
    expect(classWidth(24, classes)).toBe(2);
  });

  test("prend la classe dont la valeur est le seuil bas", () => {
    expect(classColor(30, classes)).toEqual([3, 3, 3]);
  });

  test("une valeur sous le premier seuil reste dans la première classe", () => {
    expect(classColor(0, classes)).toEqual([1, 1, 1]);
  });
});

describe("getLegendClasses", () => {
  test("affiche des bornes réelles, sans chevauchement, au format français", () => {
    expect(getLegendClasses(classes, "interval").map((c) => c.val)).toEqual(["1 – 9", "10 – 29", "30 – 1 250"]);
  });

  test("affiche une seule valeur quand la classe n'en contient qu'une", () => {
    const single: AnalyseInterface[] = [
      { val: 5, max: 5, color: [1, 1, 1], width: 1 },
      { val: 6, max: 8, color: [2, 2, 2], width: 1 },
    ];
    expect(getLegendClasses(single, "interval").map((c) => c.val)).toEqual(["5", "6 – 8"]);
  });

  test("sans borne haute connue, garde les seuils successifs", () => {
    const thresholds: AnalyseInterface[] = [
      { val: 0, color: [1, 1, 1], width: 1 },
      { val: 50, color: [2, 2, 2], width: 1 },
    ];
    expect(getLegendClasses(thresholds, "interval").map((c) => c.val)).toEqual(["0 à 50", ">= 50"]);
  });
});
