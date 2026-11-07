// End-to-end check of the main workflow in a real browser, against LOCAL
// Supabase and the dev server (npm run dev). Takes screenshots into ./tests/shots.
//   node tests/e2e.mjs
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const APP = process.env.APP_URL ?? "http://127.0.0.1:5190";
const SHOTS = new URL("./shots/", import.meta.url).pathname;
mkdirSync(SHOTS, { recursive: true });

const status = JSON.parse(execSync("npx supabase status -o json", { encoding: "utf8" }));
if (!/127\.0\.0\.1|localhost/.test(status.API_URL)) throw new Error("Local Supabase only");
const admin = createClient(status.API_URL, status.SERVICE_ROLE_KEY, { auth: { persistSession: false } });
execSync("npx supabase db reset", { stdio: "ignore" });
// Wait for the API to come back after the reset.
for (let i = 0; i < 60; i++) {
  const { error } = await admin.from("settings").select("id").limit(1);
  if (!error) break;
  await new Promise((r) => setTimeout(r, 1000));
}
await admin.auth.admin.createUser({ email: "youssef@example.com", password: "studio-pass-123", email_confirm: true });

let failures = 0;
const ok = (c, m) => (console.log(`${c ? "PASS" : "FAIL"}  ${m}`), c || failures++);
/** Waits up to 10s for a locator to be visible. */
const seen = (loc) => loc.first().waitFor({ timeout: 10000 }).then(() => true, () => false);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("dialog", (d) => d.accept());
const shot = (n) => page.screenshot({ path: `${SHOTS}${n}.png`, fullPage: true });

// 1. Public inquiry form (signed out)
await page.goto(`${APP}/inquiry?source=instagram`);
await page.getByLabel("Your name").fill("Sara Ali");
await page.getByLabel("WhatsApp number").fill("+966501234567");
await page.getByLabel("Brand / business name").fill("Sara Bakery");
await page.locator("#service").selectOption("Branding & Visual Identity");
await page.getByLabel("Tell me about the project").fill("Full identity for a new bakery in Riyadh.");
await shot("01-inquiry");
await page.getByRole("button", { name: "Send inquiry" }).click();
ok(await seen(page.getByText("Your inquiry has been received")), "inquiry form submits");

// 2. Sign in
await page.goto(APP);
await page.getByLabel("Email").fill("youssef@example.com");
await page.getByLabel("Password").fill("wrong-password");
await page.getByRole("button", { name: "Sign in" }).click();
ok(await seen(page.getByText("Wrong email or password.")), "wrong password is refused");
await page.getByLabel("Password").fill("studio-pass-123");
await page.getByRole("button", { name: "Sign in" }).click();
await page.getByRole("heading", { name: "Dashboard" }).waitFor();
ok(true, "owner signs in");
ok(await seen(page.getByRole("link", { name: /New inquiries\s*1/ })), "dashboard counts the new inquiry");

// 3. Quick add a lead from a DM
await page.getByRole("link", { name: "Leads" }).first().click();
await page.getByRole("button", { name: "+ Quick add (DM)" }).click();
await page.getByLabel("Client name").fill("Omar Khaled");
await page.getByLabel("Phone / WhatsApp").fill("+201001234567");
await page.getByLabel("Came from").selectOption("tiktok");
await page.getByLabel("What they asked for").fill("Logo + social kit");
await page.getByRole("button", { name: "Save lead" }).click();
await page.getByRole("cell", { name: /Omar Khaled/ }).waitFor();
ok(true, "quick add creates client + lead");
await shot("02-leads");
await page.getByRole("button", { name: "board" }).click();
await shot("03-leads-board");
await page.getByRole("button", { name: "table" }).click();

// 4. Service price, then quotation from the inquiry lead
await page.getByRole("link", { name: "Services" }).click();
await page.getByRole("row", { name: /Branding & Visual Identity/ }).getByRole("button", { name: "Edit" }).click();
await page.getByLabel("Default price").fill("1500");
await page.getByLabel("Deliverables (one per line)").fill("Logo suite\nColour palette\nTypography\nBrand guidelines");
await page.getByRole("button", { name: "Save" }).click();
await page.getByText("USD 1,500").waitFor();
ok(true, "service price is editable");

await page.getByRole("link", { name: "Leads" }).first().click();
await page.getByRole("row", { name: /Sara Ali/ }).getByRole("button", { name: "Quote" }).click();
await page.getByRole("heading", { name: "New quotation" }).waitFor();
await page.getByLabel("Add from service").selectOption({ label: "Branding & Visual Identity (USD 1,500)" });
await page.getByRole("button", { name: "+ Add line" }).click();
await page.getByLabel("Description").nth(1).fill("Social media templates");
await page.getByLabel("Quantity").nth(1).fill("3");
await page.getByLabel("Unit price").nth(1).fill("120");
await page.locator("label:has-text('Discount') input").fill("10");
await page.locator("label:has-text('Type') select").selectOption("percent");
await page.locator("label:has-text('Tax (%)') input").fill("15");
await page.getByLabel("Title (optional)").fill("Sara Bakery — Brand identity");
// subtotal 1860, discount 186, taxable 1674, tax 251.10, total 1925.10
ok(await seen(page.getByText("USD 1,925.1")), "live total is correct (1,925.10)");
await page.getByRole("button", { name: "Save", exact: true }).click();
await page.getByRole("heading", { name: /Quotation Q-/ }).waitFor();
ok(true, "quotation saved");
await shot("04-quotation-editor");

// 5. Print view
const [print] = await Promise.all([ctx.waitForEvent("page"), page.getByRole("button", { name: "PDF / Print" }).click()]);
await print.waitForLoadState("networkidle");
await print.getByText("Prepared for").waitFor();
ok((await print.innerText("body")).includes("USD 1,925.10"), "printable quotation shows the total");
await print.emulateMedia({ media: "print" });
await print.pdf({ path: `${SHOTS}quotation.pdf`, format: "A4" });
await print.screenshot({ path: `${SHOTS}05-quotation-print.png`, fullPage: true });
await print.close();

// 6. Sent → accepted → project
await page.getByRole("button", { name: "Mark as sent" }).click();
await page.getByText("Sent", { exact: true }).first().waitFor();
await page.getByRole("button", { name: "Accepted → create project" }).click();
await page.getByText("Sara Bakery — Brand identity").first().waitFor();
ok(page.url().includes("/projects/"), "accepted quotation opens its new project");

// 7. Payment, task, deliverable
await page.getByRole("button", { name: "+ Record payment" }).click();
await page.getByLabel("Amount").fill("962.55");
await page.getByLabel("Method").fill("Bank transfer");
await page.getByRole("button", { name: "Save" }).click();
await page.getByText("USD 962.55").first().waitFor();
await page.getByLabel("New task").fill("Moodboard");
await page.getByRole("button", { name: "Add" }).first().click();
await page.getByLabel("New deliverable").fill("Logo files (AI, SVG, PNG)");
await page.getByRole("button", { name: "Add" }).nth(1).click();
await page.getByText("Logo files (AI, SVG, PNG)").waitFor();
ok((await page.locator("text=Outstanding").locator("..").innerText()).includes("962.55"), "outstanding = budget − payments");
await shot("06-project");

// 8. Follow-ups, templates, dashboard
await page.getByRole("link", { name: "Follow-ups" }).click();
await page.getByText(/Reply to new inquiry/).waitFor();
ok(true, "inquiry created a follow-up");
await page.getByRole("checkbox", { name: /Reply to new inquiry/ }).click();
ok(await page.getByText(/Reply to new inquiry/).waitFor({ state: "hidden", timeout: 5000 }).then(() => true, () => false), "completing a follow-up removes it from the open list");
await shot("07-follow-ups");

await page.getByRole("link", { name: "Templates" }).click();
await page.getByRole("button", { name: "Quotation message" }).click();
await page.getByLabel("Client").selectOption({ label: "Sara Ali · Sara Bakery" });
await page.getByLabel("Quotation").selectOption({ index: 1 });
ok((await page.locator(".whitespace-pre-wrap").innerText()).includes("Hi Sara Ali") && (await page.locator(".whitespace-pre-wrap").innerText()).includes("USD 1,925.1"), "template placeholders fill in");
await shot("08-templates");

await page.getByRole("link", { name: "Dashboard" }).click();
await page.getByText("Received this month").waitFor();
const dash = await page.innerText("main");
ok(dash.includes("USD 962.55"), "dashboard shows revenue received");
ok(dash.includes("Outstanding on projects") && dash.includes("USD 962.55"), "dashboard shows outstanding");
await shot("09-dashboard");

// 9. Backup download + CSV
await page.getByRole("link", { name: "Settings" }).click();
const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download full backup (JSON)" }).click()]);
const backupPath = `${SHOTS}backup.json`;
await dl.saveAs(backupPath);
ok(dl.suggestedFilename().startsWith("yr-studio-backup-"), "JSON backup downloads");
const [csv] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "leads" }).click()]);
ok(csv.suggestedFilename().endsWith(".csv"), "CSV export downloads");
await page.locator("input[type=file]").setInputFiles(backupPath);
await page.getByText("Backup restored.").waitFor({ timeout: 10000 });
ok(true, "restore from the downloaded backup works");
await shot("10-settings");

// 10. Mobile
const m = await browser.newContext({ ...(await import("playwright")).devices["iPhone 13"] });
const mp = await m.newPage();
await mp.goto(APP);
await mp.getByLabel("Email").fill("youssef@example.com");
await mp.getByLabel("Password").fill("studio-pass-123");
await mp.getByRole("button", { name: "Sign in" }).click();
await mp.getByRole("heading", { name: "Dashboard" }).waitFor();
const overflow = await mp.evaluate(() => document.documentElement.scrollWidth - innerWidth);
ok(overflow <= 0, `no horizontal scroll on phone (${overflow}px)`);
await mp.screenshot({ path: `${SHOTS}11-mobile-dashboard.png`, fullPage: true });
await mp.getByRole("button", { name: "Menu" }).click();
await mp.getByRole("link", { name: "Leads", exact: true }).click();
await mp.screenshot({ path: `${SHOTS}12-mobile-leads.png`, fullPage: true });

ok(errors.length === 0, `no browser errors${errors.length ? ": " + errors.join(" | ") : ""}`);
await browser.close();
console.log(failures ? `\n${failures} FAILED` : "\nAll end-to-end checks passed");
process.exit(failures ? 1 : 0);
