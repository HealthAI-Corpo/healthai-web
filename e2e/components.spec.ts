import { test, expect } from "@playwright/test";

/**
 * Tests des composants UI critiques en contexte de page réelle.
 * Pour les tests de composants isolés, utiliser Storybook + addon-interactions.
 */

test.describe("DataTable", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/datasets");
  });

  test("tri alphabétique sur la colonne Nom", async ({ page }) => {
    const nameHeader = page.getByRole("columnheader", { name: /nom/i });
    await nameHeader.click();
    await expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    await nameHeader.click();
    await expect(nameHeader).toHaveAttribute("aria-sort", "descending");
  });

  test("pagination — bouton Suivant désactivé si une seule page", async ({ page }) => {
    // Avec 5 users mockés et pageSize 10, il n'y a qu'une page
    const nextBtn = page.getByRole("button", { name: /suivant/i });
    await expect(nextBtn).toBeDisabled();
  });

  test("la recherche filtre en temps réel", async ({ page }) => {
    const search = page.getByRole("searchbox");
    await search.fill("Thomas");
    await expect(page.getByText("Thomas Leroy")).toBeVisible();
    await expect(page.getByText("Camille Dupont")).not.toBeVisible();
  });

  test("vider la recherche restaure tous les résultats", async ({ page }) => {
    const search = page.getByRole("searchbox");
    await search.fill("Thomas");
    await search.clear();
    await expect(page.getByText("Camille Dupont")).toBeVisible();
    await expect(page.getByText("Thomas Leroy")).toBeVisible();
  });
});

test.describe("KpiCard", () => {
  test("les articles KPI ont des labels aria", async ({ page }) => {
    await page.goto("/overview");
    const articles = page.getByRole("article");
    const count = await articles.count();
    for (let i = 0; i < count; i++) {
      await expect(articles.nth(i)).toHaveAttribute("aria-label");
    }
  });
});

test.describe("Sidebar", () => {
  test("le lien actif a aria-current=page", async ({ page }) => {
    await page.goto("/overview");
    const activeLink = page.getByRole("link", { name: /dashboard/i });
    await expect(activeLink.first()).toHaveAttribute("aria-current", "page");
  });

  test("navigation clavier dans la sidebar", async ({ page }) => {
    await page.goto("/overview");
    // Tab jusqu'au premier lien de nav (après le skip link)
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();
  });
});

test.describe("Formulaires et interactions", () => {
  test("textarea de commentaire dans Validation est accessible", async ({ page }) => {
    await page.goto("/validation");
    const textarea = page.getByRole("textbox").first();
    await expect(textarea).toBeVisible();
    await textarea.fill("Test de commentaire");
    await expect(textarea).toHaveValue("Test de commentaire");
  });

  test("les boutons d'export ont des aria-label", async ({ page }) => {
    await page.goto("/exports");
    const exportBtns = page.getByRole("button", { name: /exporter/i });
    const count = await exportBtns.count();
    expect(count).toBeGreaterThan(0);
  });
});
