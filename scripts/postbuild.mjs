// After the static build: add GitHub Pages files (404 page, custom domain, no Jekyll).
import fs from "node:fs";

const out = "dist/client";

// GitHub Pages serves 404.html at whatever unknown URL was requested, so the app
// can't hydrate there (its URL never matches /404). Ship it as plain HTML:
// same look, working links, no app scripts.
const src = `${out}/404/index.html`;
if (fs.existsSync(src)) {
  let html = fs.readFileSync(src, "utf8");
  html = html
    .replace(/<script type="module"[^>]*><\/script>/g, "")
    .replace(/<script class="\$tsr"[\s\S]*?<\/script>/g, "")
    .replace(/<link[^>]*rel="modulepreload"[^>]*>/g, "");
  fs.writeFileSync(`${out}/404.html`, html);
}

fs.writeFileSync(`${out}/CNAME`, "yrstudio.art\n");
fs.writeFileSync(`${out}/.nojekyll`, "");
console.log("postbuild: 404.html, CNAME, .nojekyll written");
