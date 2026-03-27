import pgm from "node-pg-migrate";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const pgmCjs = require("node-pg-migrate");

console.log("ESM pgm types:", typeof pgm);
console.log("ESM pgm keys:", Object.keys(pgm || {}));
console.log("CJS pgm types:", typeof pgmCjs);
console.log("CJS pgm keys:", Object.keys(pgmCjs || {}));
