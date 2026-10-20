// Static publication allowlist: never publish the repository root or tooling.
import { cp, mkdir, rm } from "node:fs/promises";
await rm("_site", { recursive: true, force: true });
await mkdir("_site/assets", { recursive: true });
for (const file of ["index.html", "style.css", "LICENSE", ".nojekyll"]) await cp(file, `_site/${file}`);
await cp("src", "_site/src", { recursive: true });
await cp("assets/prism.svg", "_site/assets/prism.svg");
await cp("assets/screenshots", "_site/assets/screenshots", { recursive: true });
console.log("BrikaVolt static artifact: index, CSS, local modules, favicon, project screenshots, MIT notice.");
