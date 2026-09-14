/**
 * CSS değişken denetimi.
 *
 * Neden var: tanımsız bir `var(--x)` CSS'te hata vermez. Bildirim
 * "hesaplanan değerde geçersiz" sayılır ve özellik sessizce mirasa ya da
 * başlangıç değerine düşer; derleme de lint de bunu görmez.
 *
 * Bir kez yeni token'lar commit'e alınmadan gönderilmek üzereydi: hero
 * başlığı gövde puntosuna küçülecek, tüm panellerin iç boşluğu
 * sıfırlanacaktı. İade formundaki `var(--t-base)` ise hiç tanımlanmadan
 * günlerce canlıda kaldı. İkisini de bu denetim buldu.
 *
 * Ne yapar: kök altındaki bütün .css dosyalarını okur, tanımlanan her
 * özel özelliği (`--ad:`) toplar ve yedeksiz her `var(--ad)` kullanımının
 * bir tanımı olup olmadığına bakar. CSS dışından verilen değişkenler
 * (next/font'un `variable` adları, satır içi `style`, `setProperty`)
 * .ts/.tsx dosyalarındaki "--ad" dizge sabitlerinden okunur.
 *
 * Sınır: kapsam farkında değil — bir değişken herhangi bir seçicide
 * tanımlıysa tanımlı sayılır.
 *
 * Kullanım:  node scripts/check-css-vars.mjs [kök=src]
 */
import fs from "node:fs";
import path from "node:path";

const root = process.argv[2] ?? "src";

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = walk(root);
const cssFiles = files.filter((file) => file.endsWith(".css"));
const codeFiles = files.filter((file) => /\.(tsx?|jsx?|mjs)$/.test(file));

// Yorumlar boşlukla değiştirilir, satır sonları korunur: bildirilen satır
// numaraları dosyadakiyle aynı kalsın.
const stripComments = (text) =>
  text.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "));

const defined = new Set();
const sources = cssFiles.map((file) => {
  const text = stripComments(fs.readFileSync(file, "utf8"));
  for (const match of text.matchAll(/(--[\w-]+)\s*:/g)) defined.add(match[1]);
  return { file, text };
});

const external = new Set();
for (const file of codeFiles) {
  const text = fs.readFileSync(file, "utf8");
  for (const match of text.matchAll(/["'`](--[a-z0-9-]+)["'`]/gi)) external.add(match[1]);
}

const problems = [];
for (const { file, text } of sources) {
  for (const match of text.matchAll(/var\(\s*(--[\w-]+)\s*(,)?/g)) {
    const [, name, hasFallback] = match;
    if (hasFallback || defined.has(name) || external.has(name)) continue;
    const line = text.slice(0, match.index).split("\n").length;
    problems.push(`${file}:${line}  ${name}`);
  }
}

if (problems.length > 0) {
  console.error(`CSS değişken denetimi: ${problems.length} tanımsız kullanım.\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  console.error(
    "\nTanımsız var() sessizce geçersiz sayılır; özellik mirasa ya da başlangıç" +
      "\ndeğerine düşer. Değişkeni tanımlayın (tokens.css), bir yedek verin" +
      "\n— var(--x, değer) — ya da adı düzeltin.",
  );
  process.exit(1);
}

console.log(
  `CSS değişken denetimi: ${cssFiles.length} dosya, ${defined.size} tanım, sorun yok.`,
);
