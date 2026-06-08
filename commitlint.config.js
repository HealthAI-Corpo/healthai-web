/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  ignorePatterns: [
    // Historical commits predating conventional-commit enforcement
    '^hotfix\\s*:',
    '^Push Important',
    '^correction erreur',
    '^rebelotte',
    '^Potential fix for code scanning',
    '^Merge pull request',
    '^Merge branch',
  ],
};
