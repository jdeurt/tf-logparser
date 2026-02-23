import { defineConfig } from "@eslint/config-helpers";
import tseslint from "typescript-eslint";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";

export default defineConfig(
  {
    ignores: ["dist/", "node_modules/", "src/generated/"],
  },
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.mjs", "src/__tests__/*.ts"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  eslintPluginPrettier,
);
