import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  ZITADEL_ROLES_CLAIM,
  extractRole,
  syncUtilisateur,
  isPublicPath,
  getRedirect,
  type GuardSession,
} from "./helpers";

// ─── extractRole ──────────────────────────────────────────────────────────────

describe("extractRole", () => {
  it("retourne admin quand le claim Zitadel contient le rôle admin", () => {
    const profile = {
      sub: "376539212112986115",
      [ZITADEL_ROLES_CLAIM]: { admin: { "326102453988132865": "org.zitadel" } },
    };
    expect(extractRole(profile)).toBe("admin");
  });

  it("retourne user quand le claim contient d'autres rôles", () => {
    const profile = {
      [ZITADEL_ROLES_CLAIM]: { user: { "326102453988132865": "org.zitadel" } },
    };
    expect(extractRole(profile)).toBe("user");
  });

  it("retourne user quand le claim est absent (rôles non assertés)", () => {
    expect(extractRole({ sub: "123", email: "a@b.c" })).toBe("user");
  });

  it("retourne user quand le claim n'est pas un objet", () => {
    expect(extractRole({ [ZITADEL_ROLES_CLAIM]: "admin" })).toBe("user");
  });
});

// ─── syncUtilisateur ─────────────────────────────────────────────────────────

describe("syncUtilisateur", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("appelle POST /utilisateurs/sync avec le Bearer token", async () => {
    fetchMock.mockResolvedValue({ ok: true });

    await syncUtilisateur("token-zitadel");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/utilisateurs\/sync$/),
      {
        method: "POST",
        headers: { Authorization: "Bearer token-zitadel" },
      },
    );
  });

  it("logge sans throw quand l'API répond une erreur HTTP", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500 });

    await expect(syncUtilisateur("token")).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("HTTP 500"),
    );
  });

  it("logge sans throw quand l'API est injoignable (login non bloqué)", async () => {
    fetchMock.mockRejectedValue(new Error("ECONNREFUSED"));

    await expect(syncUtilisateur("token")).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });
});

// ─── isPublicPath ────────────────────────────────────────────────────────────

describe("isPublicPath", () => {
  it.each(["/login", "/api/auth/callback/zitadel", "/_next/data", "/favicon.ico"])(
    "considère %s comme public",
    (path) => {
      expect(isPublicPath(path)).toBe(true);
    },
  );

  it.each(["/", "/overview", "/datasets", "/dashboard"])(
    "considère %s comme protégé",
    (path) => {
      expect(isPublicPath(path)).toBe(false);
    },
  );
});

// ─── getRedirect (guards du middleware) ──────────────────────────────────────

describe("getRedirect", () => {
  const admin: GuardSession = { user: { role: "admin" } };
  const user: GuardSession = { user: { role: "user" } };

  describe("visiteur non connecté", () => {
    it("redirige vers /login sur une page protégée", () => {
      expect(getRedirect("/overview", null)).toBe("/login");
      expect(getRedirect("/datasets", null)).toBe("/login");
    });

    it("laisse passer les chemins publics", () => {
      expect(getRedirect("/login", null)).toBeNull();
      expect(getRedirect("/api/auth/callback/zitadel", null)).toBeNull();
    });
  });

  describe("utilisateur connecté (rôle user)", () => {
    it("accède aux pages client et dashboard", () => {
      expect(getRedirect("/dashboard", user)).toBeNull();
      expect(getRedirect("/nutrition", user)).toBeNull();
      expect(getRedirect("/overview", user)).toBeNull();
    });

    it.each(["/datasets", "/exports", "/validation"])(
      "est redirigé vers /overview depuis la page admin %s",
      (path) => {
        expect(getRedirect(path, user)).toBe("/overview");
      },
    );

    it("est renvoyé vers /overview depuis /login", () => {
      expect(getRedirect("/login", user)).toBe("/overview");
    });
  });

  describe("administrateur", () => {
    it.each(["/datasets", "/exports", "/validation"])(
      "accède à la page admin %s",
      (path) => {
        expect(getRedirect(path, admin)).toBeNull();
      },
    );

    it("accède aussi aux pages non-admin", () => {
      expect(getRedirect("/overview", admin)).toBeNull();
    });
  });
});
