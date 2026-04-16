/**
 * Next.js instrumentation — no-op
 *
 * Le routing ZITADEL Docker est géré par extra_hosts dans docker-compose.yml :
 *   extra_hosts:
 *     - "localhost:host-gateway"
 *
 * Cela fait que localhost:8080 dans le container rejoint le host Docker
 * (où ZITADEL est exposé sur le port 8080) avec Host: localhost:8080,
 * ce qui correspond au domaine enregistré dans l'instance ZITADEL.
 */
export async function register() {
  // no-op — routing handled by extra_hosts in docker-compose.yml
}
