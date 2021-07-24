/**
 * ESLint configuration.
 *
 * @see https://eslint.org/docs/user-guide/configuring
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
    root: true,
  
    env: { es6: true },

    extends: ["eslint:recommended", "prettier"],

    parserOptions: { ecmaVersion: 2020 },
    overrides: [
      {
        files: ["*.ts", ".tsx"],
        parser: "@typescript-eslint/parser",
        extends: ["plugin:@typescript-eslint/recommended"],
        plugins: ["@typescript-eslint"],
        parserOptions: {
          sourceType: "module",
          warnOnUnsupportedTypeScriptVersion: true,
        },
        rules: {
          "@typescript-eslint/explicit-module-boundary-types": "off",
          "@typescript-eslint/no-unused-vars": "off",
        },
        env: { node: true },
      },
      {
        files: ["*.test.ts", "*.spec.ts"],
        env: { jest: true },
      },
    ],
    ignorePatterns: [
      "/dist",
      "/.history",
      "/.git",
      "/.yarn",
      ".eslintrc.js",
      "jest.config.js",
      "/**/__snapshots__",
    ],
};