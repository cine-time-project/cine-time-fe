import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import unusedImports from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends("next/core-web-vitals"),

  {
    plugins: {
      "unused-imports": unusedImports,
    },

    rules: {
      // Kullanılmayan importları sil
      "unused-imports/no-unused-imports": "error",

      // Uyarıları kapatıyoruz:
      "import/no-anonymous-default-export": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },

  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];
