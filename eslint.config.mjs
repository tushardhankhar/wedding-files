import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Import-boundary rule enforcing the two-trust-domain architecture:
 * the service-role Supabase client and server-only env must never be reachable
 * from the browser bundle. They are forbidden everywhere, then re-allowed only
 * in server-side locations.
 */
const restrictedServerModules = {
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@/lib/supabase/service", "**/lib/supabase/service"],
            message:
              "Service-role client BYPASSES RLS. Import it only from modules/*/server/** or app/api/**, behind an explicit authorization check.",
          },
          {
            group: ["@/lib/env.server", "**/env.server"],
            message:
              "Server-only secrets. Import env.server only from server-side module code.",
          },
        ],
      },
    ],
  },
};

const allowServerModules = {
  files: [
    "src/modules/**/server/**",
    "src/app/api/**",
    "src/lib/supabase/service.ts",
    "src/lib/env.server.ts",
  ],
  rules: {
    "no-restricted-imports": "off",
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  restrictedServerModules,
  allowServerModules,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
