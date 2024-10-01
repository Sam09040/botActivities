import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


export default [
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
<<<<<<< HEAD
<<<<<<< HEAD
];
=======
];
>>>>>>> e684f95 (Addint eslint and prettier)
=======
];
>>>>>>> 7bc8caa (Small changes)
