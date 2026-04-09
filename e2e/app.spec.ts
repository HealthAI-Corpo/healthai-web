import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// ─── Navigation ───────────────────────────────────────────────────────────────

test.describe("Navigation principale", () => {
  test("redirige / vers /overview", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/overview");
  });

  test("affiche le dashboard overview", async ({ page }) => {
    await page.goto("/overview");
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
  });

  test("navigue vers Analytics", async ({ page }) => {
    await page.goto("/overview");
    await page.getByRole("link", { name: /analytics/i }).first().click();
    await expect(page).toHaveURL("/analytics");
    await expect(page.getByRole("heading", { name: /analytics/i })).toBeVisible();
  });

  test("navigue vers Pipelines ETL", async ({ page }) => {
    await page.goto("/overview");
    await page.getByRole("link", { name: /pipelines etl/i }).click();
    await expect(page).toHaveURL("/pipelines");
  });

  test("navigue vers Datasets", async ({ page }) => {
    await page.goto("/overview");
    await page.getByRole("link", { name: /datasets/i }).click();
    await expect(page).toHaveURL("/datasets");
  });

  test("navigue vers Validation", async ({ page }) => {
    await page.goto("/overview");
    await page.getByRole("link", { name: /validation/i }).click();
    await expect(page).toHaveURL("/validation");
  });

  test("navigue vers Exports", async ({ page }) => {
    await page.goto("/overview");
    await page.getByRole("link", { name: /exports/i }).click();
    await expect(page).toHaveURL("/exports");
  });
});

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────

test.describe("Dashboard Overview", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/overview");
  });

  test("affiche les 7 KPI cards", async ({ page }) => {
    const articles = page.getByRole("article");
    await expect(articles).toHaveCount(7);
  });

  test("affiche la section croissance utilisateurs", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /croissance utilisateurs/i })).toBeVisible();
  });

  test("affiche le tableau de qualité des données", async ({ page }) => {
    await expect(page.getByRole("table", { name: /qualité des datasets/i })).toBeVisible();
  });
});

// ─── Pipelines ────────────────────────────────────────────────────────────────

test.describe("Page Pipelines", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pipelines");
  });

  test("affiche les boutons de filtre", async ({ page }) => {
    const filterGroup = page.getByRole("group", { name: /filtrer par statut/i });
    await expect(filterGroup).toBeVisible();
  });

  test("filtre par statut Erreur", async ({ page }) => {
    await page.getByRole("button", { name: /erreur/i }).click();
    const rows = page.getByRole("cell", { name: /erreur/i });
    await expect(rows.first()).toBeVisible();
  });

  test("affiche le message d'erreur du pipeline rejeté", async ({ page }) => {
    await expect(page.getByText(/schema mismatch/i)).toBeVisible();
  });

  test("bouton Rafraîchir est accessible et cliquable", async ({ page }) => {
    const btn = page.getByRole("button", { name: /rafraîchir/i });
    await expect(btn).toBeVisible();
    await btn.click();
  });
});

// ─── Datasets ─────────────────────────────────────────────────────────────────

test.describe("Page Datasets", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/datasets");
  });

  test("affiche l'alerte d'anomalies", async ({ page }) => {
    await expect(page.getByRole("alert")).toBeVisible();
  });

  test("les onglets de datasets sont accessibles", async ({ page }) => {
    const tablist = page.getByRole("tablist");
    await expect(tablist).toBeVisible();
    await expect(page.getByRole("tab", { name: /utilisateurs/i })).toHaveAttribute("aria-selected", "true");
  });

  test("change d'onglet vers Nutrition", async ({ page }) => {
    await page.getByRole("tab", { name: /nutrition/i }).click();
    await expect(page.getByRole("tab", { name: /nutrition/i })).toHaveAttribute("aria-selected", "true");
  });

  test("la recherche filtre le tableau", async ({ page }) => {
    const search = page.getByRole("searchbox");
    await search.fill("Camille");
    await expect(page.getByText("Camille Dupont")).toBeVisible();
  });
});

// ─── Validation ───────────────────────────────────────────────────────────────

test.describe("Workflow Validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/validation");
  });

  test("affiche les items en attente", async ({ page }) => {
    await expect(page.getByText(/en attente/i).first()).toBeVisible();
  });

  test("approuve un dataset", async ({ page }) => {
    const approveBtn = page.getByRole("button", { name: /approuver/i }).first();
    await approveBtn.click();
    await expect(page.getByText(/approuvé/i).first()).toBeVisible();
  });

  test("rejette un dataset", async ({ page }) => {
    const rejectBtn = page.getByRole("button", { name: /rejeter/i }).first();
    await rejectBtn.click();
    await expect(page.getByText(/rejeté/i).first()).toBeVisible();
  });
});

// ─── Exports ──────────────────────────────────────────────────────────────────

test.describe("Page Exports", () => {
  test("affiche les cartes d'export", async ({ page }) => {
    await page.goto("/exports");
    await expect(page.getByText("Profils utilisateurs")).toBeVisible();
    await expect(page.getByText("Données nutritionnelles")).toBeVisible();
  });

  test("le bouton export CSV est accessible", async ({ page }) => {
    await page.goto("/exports");
    const csvBtns = page.getByRole("button", { name: /exporter.*csv/i });
    await expect(csvBtns.first()).toBeVisible();
  });
});

// ─── Accessibilité RGAA AA ────────────────────────────────────────────────────

test.describe("Accessibilité (RGAA AA via axe-core)", () => {
  const PAGES = [
    { name: "Overview", url: "/overview" },
    { name: "Analytics", url: "/analytics" },
    { name: "Pipelines", url: "/pipelines" },
    { name: "Datasets", url: "/datasets" },
    { name: "Validation", url: "/validation" },
    { name: "Exports", url: "/exports" },
  ];

  for (const p of PAGES) {
    test(`${p.name} — aucune violation axe-core`, async ({ page }) => {
      await page.goto(p.url);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test("skip link est visible au focus clavier", async ({ page }) => {
    await page.goto("/overview");
    await page.keyboard.press("Tab");
    const skipLink = page.getByText(/aller au contenu principal/i);
    await expect(skipLink).toBeVisible();
  });
});
