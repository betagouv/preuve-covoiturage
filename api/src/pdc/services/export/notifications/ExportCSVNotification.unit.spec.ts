import { assertEquals, assertStringIncludes } from "dep:assert";
import { describe, it } from "dep:testing-bdd";
import { ExportCSVNotification, exportsUrl } from "./ExportCSVNotification.ts";

describe("ExportCSVNotification", () => {
  it("construit l'URL des exports à partir de l'URL du front", () => {
    assertEquals(exportsUrl("https://partenaire.example.com"), "https://partenaire.example.com/activite/export/");
    assertEquals(exportsUrl("http://localhost:4200/"), "http://localhost:4200/activite/export/");
  });

  it("le bouton et le texte suivent l'URL injectée", () => {
    const notification = new ExportCSVNotification("U <u@example.com>", { fullname: "U" }, "https://demo.example.com");

    assertEquals(notification.data.action_href, "https://demo.example.com/activite/export/");
    assertStringIncludes(notification.data.message_text ?? "", "https://demo.example.com/activite/export/");
  });
});
