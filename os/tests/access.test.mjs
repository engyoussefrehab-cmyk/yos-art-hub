// Database security + automation tests. Runs against the LOCAL Supabase
// (`npx supabase start`). Never point this at production: it creates users.
//   node tests/access.test.mjs
import { createClient } from "@supabase/supabase-js";
import { execSync } from "node:child_process";

const status = JSON.parse(execSync("npx supabase status -o json", { encoding: "utf8" }));
const URL = status.API_URL;
if (!/127\.0\.0\.1|localhost/.test(URL)) throw new Error("Refusing to run outside local Supabase");
const ANON = status.ANON_KEY;
const SERVICE = status.SERVICE_ROLE_KEY;

let failures = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${msg}`);
  if (!cond) failures++;
};
const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(URL, SERVICE, opts);

async function userClient(email) {
  await admin.auth.admin.createUser({ email, password: "test-password-123", email_confirm: true });
  const c = createClient(URL, ANON, opts);
  const { error } = await c.auth.signInWithPassword({ email, password: "test-password-123" });
  if (error) throw error;
  return c;
}

// Fresh state: wipe users (cascades owners) and data.
const { data: list } = await admin.auth.admin.listUsers();
for (const u of list.users) await admin.auth.admin.deleteUser(u.id);
for (const t of ["follow_ups", "payments", "project_items", "projects", "quotation_items", "quotations", "leads", "clients", "inquiry_log"]) {
  await admin.from(t).delete().not("id", "is", null);
}

const owner = await userClient("owner@example.com"); // first user → owner
const stranger = await userClient("stranger@example.com"); // signed in, not owner
const anon = createClient(URL, ANON, opts);

// ── Sign-up is closed
{
  const { error } = await createClient(URL, ANON, opts).auth.signUp({ email: "new@example.com", password: "test-password-123" });
  ok(!!error, "public sign-up is disabled");
}

// ── Owner can write
const { data: client, error: cErr } = await owner.from("clients").insert({ name: "Nook Café", email: "hi@nook.test" }).select().single();
ok(!cErr && client, "owner can create a client");

// ── Anonymous and stranger cannot read or write private data
for (const [who, c] of [["anon", anon], ["stranger", stranger]]) {
  for (const t of ["clients", "leads", "quotations", "projects", "payments", "follow_ups", "templates", "settings", "services", "inquiry_log"]) {
    const { data, error } = await c.from(t).select("*").limit(5);
    ok(!!error || (data ?? []).length === 0, `${who} cannot read ${t}`);
  }
  const { error } = await c.from("clients").insert({ name: "Hacker" });
  ok(!!error, `${who} cannot insert clients`);
  const { data: upd } = await c.from("clients").update({ name: "pwned" }).eq("id", client.id).select();
  ok((upd ?? []).length === 0, `${who} cannot update clients`);
  const { data: del } = await c.from("clients").delete().eq("id", client.id).select();
  ok((del ?? []).length === 0, `${who} cannot delete clients`);
}
const { data: still } = await owner.from("clients").select("name").eq("id", client.id).single();
ok(still?.name === "Nook Café", "client unchanged after attacks");

// ── Public inquiry form
{
  const { error } = await anon.rpc("submit_inquiry", {
    payload: { name: "Sara Ali", email: "Sara@Brand.test", phone: "+966 50 123 4567", brand: "Sara Brand", service: "Logo Design", brief: "New logo", budget: "800", currency: "SAR", source: "instagram" },
  });
  ok(!error, "anon can submit the inquiry form" + (error ? ` (${error.message})` : ""));
  const { data: leads } = await owner.from("leads").select("*, clients(name,email,phone), services(name)").eq("source", "instagram");
  ok(leads?.length === 1 && leads[0].clients.email === "sara@brand.test" && leads[0].services?.name === "Logo Design", "inquiry saved as lead + client, linked to service");
  ok(leads?.[0]?.status === "new_inquiry" && Number(leads[0].budget) === 800 && leads[0].currency === "SAR", "lead has status, budget and currency");
  const { data: fu } = await owner.from("follow_ups").select("*").eq("lead_id", leads[0].id);
  ok(fu?.length === 1, "inquiry creates a 'reply today' follow-up");

  await anon.rpc("submit_inquiry", { payload: { name: "Sara Ali", email: "sara@brand.test", brief: "second" } });
  const { count } = await owner.from("clients").select("*", { count: "exact", head: true }).eq("email", "sara@brand.test");
  ok(count === 1, "repeat inquiry reuses the existing client");

  await anon.rpc("submit_inquiry", { payload: { name: "Bot", email: "bot@spam.test", website: "http://spam" } });
  const { count: bots } = await owner.from("clients").select("*", { count: "exact", head: true }).eq("email", "bot@spam.test");
  ok(bots === 0, "honeypot submissions are dropped");

  const bad = await anon.rpc("submit_inquiry", { payload: { name: "X" } });
  ok(!!bad.error, "invalid submissions are rejected");

  await anon.rpc("submit_inquiry", { payload: { name: "Sara Ali", email: "sara@brand.test" } });
  const limited = await anon.rpc("submit_inquiry", { payload: { name: "Sara Ali", email: "sara@brand.test" } });
  ok(!!limited.error && /Too many/.test(limited.error.message), "rate limit after 3 per hour per contact");

  const { data: svc } = await anon.rpc("public_services");
  ok(Array.isArray(svc) && svc.length === 6 && !("default_price" in svc[0]), "public form sees service names only");
}

// ── Quotation totals and automations
{
  const { data: lead } = await owner.from("leads").insert({ client_id: client.id, source: "whatsapp" }).select().single();
  const { data: q } = await owner
    .from("quotations")
    .insert({ client_id: client.id, lead_id: lead.id, currency: "USD", discount_type: "percent", discount_value: 10, tax_rate: 14, title: "Nook identity" })
    .select()
    .single();
  await owner.from("quotation_items").insert([
    { quotation_id: q.id, description: "Visual identity", quantity: 1, unit_price: 1000, sort: 1 },
    { quotation_id: q.id, description: "Social templates", quantity: 3, unit_price: 33.33, sort: 2 },
  ]);
  const { data: tq } = await owner.from("quotations").select("quotation_totals").eq("id", q.id).single();
  const t = tq.quotation_totals;
  // subtotal 1000 + 99.99 = 1099.99; discount 10% = 110.00; taxable 989.99; tax 14% = 138.60; total 1128.59
  ok(Number(t.subtotal) === 1099.99 && Number(t.discount) === 110 && Number(t.tax) === 138.6 && Number(t.total) === 1128.59, `quotation totals correct (${t.subtotal}/${t.discount}/${t.tax}/${t.total})`);

  await owner.from("quotations").update({ status: "sent" }).eq("id", q.id);
  const { data: l1 } = await owner.from("leads").select("status").eq("id", lead.id).single();
  const { count: qfu } = await owner.from("follow_ups").select("*", { count: "exact", head: true }).eq("quotation_id", q.id).is("done_at", null);
  ok(l1.status === "quotation_sent" && qfu === 1, "sending a quotation updates the lead and adds a follow-up");

  await owner.from("quotations").update({ status: "accepted" }).eq("id", q.id);
  const { data: p } = await owner.from("projects").select("*").eq("quotation_id", q.id);
  const { data: l2 } = await owner.from("leads").select("status").eq("id", lead.id).single();
  const { count: qfu2 } = await owner.from("follow_ups").select("*", { count: "exact", head: true }).eq("quotation_id", q.id).is("done_at", null);
  ok(p?.length === 1 && Number(p[0].budget) === 1128.59 && p[0].name === "Nook identity", "accepted quotation becomes a project with its total");
  ok(l2.status === "won" && qfu2 === 0, "lead marked won and quotation follow-up closed");

  await owner.from("quotations").update({ status: "sent" }).eq("id", q.id);
  await owner.from("quotations").update({ status: "accepted" }).eq("id", q.id);
  const { count: pc } = await owner.from("projects").select("*", { count: "exact", head: true }).eq("quotation_id", q.id);
  ok(pc === 1, "re-accepting does not duplicate the project");

  const { error: payErr } = await owner.from("payments").insert({ project_id: p[0].id, amount: 500, currency: "USD" });
  ok(!payErr, "owner can record a payment");
  const { error: negErr } = await owner.from("payments").insert({ project_id: p[0].id, amount: -5, currency: "USD" });
  ok(!!negErr, "negative payments are rejected");

  await owner.from("leads").update({ next_follow_up: "2030-01-01" }).eq("id", lead.id);
  await owner.from("leads").update({ next_follow_up: "2030-02-01" }).eq("id", lead.id);
  const { data: lfu } = await owner.from("follow_ups").select("due_date").eq("lead_id", lead.id).is("quotation_id", null).is("done_at", null);
  ok(lfu?.length === 1 && lfu[0].due_date === "2030-02-01", "lead next follow-up keeps one reminder in sync");
}

// ── Backup and restore
{
  for (const [who, c] of [["anon", anon], ["stranger", stranger]]) {
    const { data, error } = await c.rpc("export_backup");
    ok(!!error && !data, `${who} cannot export a backup`);
    const r = await c.rpc("restore_backup", { backup: { app: "yr-studio-os", tables: {} } });
    ok(!!r.error, `${who} cannot restore a backup`);
  }
  const { data: backup, error } = await owner.rpc("export_backup");
  ok(!error && backup?.tables?.clients?.length >= 2, "owner can export a JSON backup");
  const counts = Object.fromEntries(Object.entries(backup.tables).map(([k, v]) => [k, v.length]));

  await owner.from("clients").insert({ name: "Added after backup" });
  const { error: rErr } = await owner.rpc("restore_backup", { backup });
  ok(!rErr, "owner can restore" + (rErr ? ` (${rErr.message})` : ""));
  const { data: after } = await owner.rpc("export_backup");
  const same = Object.entries(counts).every(([k, n]) => after.tables[k].length === n);
  ok(same, "restore brings every table back to the backup (no duplicates from automations)");
  ok(!after.tables.clients.some((c) => c.name === "Added after backup"), "restore replaces data added after the backup");

  const { data: newLead } = await owner.from("leads").insert({ client_id: client.id }).select("ref").single();
  const maxRef = Math.max(...backup.tables.leads.map((l) => Number(l.ref.slice(2))));
  ok(Number(newLead.ref.slice(2)) === maxRef + 1, `reference numbers continue after restore (${newLead.ref})`);

  const bad = await owner.rpc("restore_backup", { backup: { hello: "world" } });
  ok(!!bad.error, "restore rejects files that are not backups");
  const { count } = await owner.from("clients").select("*", { count: "exact", head: true });
  ok(count === counts.clients, "a rejected restore changes nothing");
}

console.log(failures ? `\n${failures} FAILED` : "\nAll tests passed");
process.exit(failures ? 1 : 0);
