// Gera o hash do script inline do index.html (tema salvo, aplicado antes da renderização).
// Rode `node scripts/csp-hash.mjs` sempre que esse script mudar e atualize o valor em vercel.json.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error("Script inline não encontrado em index.html");
console.log(`'sha256-${createHash("sha256").update(match[1]).digest("base64")}'`);
