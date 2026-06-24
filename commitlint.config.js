/** @type {import('@commitlint/types').UserConfig} */

// Commit subjects that must be skipped by commitlint. These are historical or
// merge/squash artifacts that cannot follow the conventional-commit format.
// NB: commitlint expects `ignores` (matcher functions), not `ignorePatterns`.
const ignoredCommitPatterns = [
  // Historical commits predating conventional-commit enforcement
  /^hotfix\s*:/,
  /^Push Important/,
  /^correction erreur/,
  /^rebelotte/,
  /^Potential fix for code scanning/,
  /^Merge pull request/,
  /^Merge branch/,
  // Merge/squash artifacts whose subject is a branch name or a stray note
  /^Feat\/mobile target integration/,
  /^Resolution 404/,
];

module.exports = {
  extends: ['@commitlint/config-conventional'],
  ignores: [(message) => ignoredCommitPatterns.some((pattern) => pattern.test(message))],
};
