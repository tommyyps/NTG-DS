/**
 * สร้าง map token แถวเอกสาร Figma (ข้อความใน _Lead) -> ชื่อตัวแปร Figma color/...
 * จากโครงสร้าง semantics-light-mode.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const semPath = resolve(__dirname, "../../tokens/semantics-light-mode.json");
const sem = JSON.parse(readFileSync(semPath, "utf8"));

/** @type {Record<string, string>} */
const leadToVarName = {};

function pathToLead(pathKeys) {
  const p = [...pathKeys];
  while (p.length && p[p.length - 1] === "default") p.pop();
  if (p.length === 0) return null;
  const cat = p[0];
  if (cat === "text") {
    if (p.length === 2) return `text-${p[1]}`;
    if (p.length === 3) return `text-${p[1]}_${p[2].replace(/-/g, "_")}`;
    return `text-${p[1]}_${p.slice(2).join("_").replace(/-/g, "_")}`;
  }
  if (cat === "background") {
    const rest = p.slice(1);
    if (rest.length === 1) return `bg-${rest[0]}`;
    if (rest[0] === "brand") {
      const tail = rest.slice(1).join("-").replace(/-/g, "_");
      return `bg-brand-${tail}`;
    }
    if (rest.length === 2) return `bg-${rest[0]}_${rest[1].replace(/-/g, "_")}`;
    return `bg-${rest.join("-").replace(/-/g, "_")}`;
  }
  if (cat === "border") {
    if (p[1] === "general") {
      const g = p.slice(2);
      if (g.length === 1) return `border-${g[0]}`;
      return `border-${g.join("-")}`;
    }
    if (p[1] === "system") {
      const g = p.slice(2);
      return `border-${g.join("-")}`;
    }
    if (p[1] === "brand") {
      const g = p.slice(2);
      return `border-brand-${g.join("-")}`;
    }
    return `border-${p.slice(1).join("-")}`;
  }
  if (cat === "foreground") {
    const rest = p.slice(1);
    if (rest.length === 1) return `fg-${rest[0]}`;
    if (rest.length === 2) return `fg-${rest[0]}_${rest[1].replace(/-/g, "_")}`;
    return `fg-${rest[0]}_${rest.slice(1).join("_").replace(/-/g, "_")}`;
  }
  if (cat === "alpha") {
    const rest = p.slice(1);
    return `alpha-${rest.join("-")}`;
  }
  if (cat === "utility") {
    const rest = p.slice(1);
    return `utility-${rest.join("-")}`;
  }
  return null;
}

function walk(obj, path) {
  if (!obj || typeof obj !== "object") return;
  if (obj.$type === "color" && obj.$extensions?.figma?.variableId) {
    const lead = pathToLead(path);
    if (lead) {
      const fullName = `color/${path.join("/")}`;
      if (leadToVarName[lead] && leadToVarName[lead] !== fullName) {
        console.warn("duplicate lead", lead, leadToVarName[lead], fullName);
      }
      leadToVarName[lead] = fullName;
    }
    return;
  }
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith("$")) continue;
    walk(v, [...path, k]);
  }
}

walk(sem.color, []);

const outPath = resolve(__dirname, "figma-doc-color-lead-map.json");
writeFileSync(outPath, JSON.stringify(leadToVarName, null, 0), "utf8");
console.log("wrote", outPath, "keys", Object.keys(leadToVarName).length);
