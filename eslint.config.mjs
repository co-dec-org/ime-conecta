import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextVitals,
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "next-env.d.ts", "tsconfig.tsbuildinfo"]
  }
];

export default eslintConfig;
