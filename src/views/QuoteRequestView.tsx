import { useState } from "react";
import { WA } from "@/components/studio-site";
import { categoryExamples, completeIdentityOption, groups, identityPackage, packages } from "@/content/quote-services";
import "./quote-request.css";

const number = new Intl.NumberFormat("ar-EG");
const whatsappUrl = new URL(WA);
whatsappUrl.searchParams.set("text", "أهلًا يوسف، عايز أطلب تسعير للخدمات الموجودة في ملف الـPDF المرفق.");

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[اأإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F]/g, "").replace(/بروشور/g, "برشور");
}

function PackageItems({ id, label, items, selected, hidden, onChange }: {
  id?: string;
  label: string;
  items: string[];
  selected: Set<string>;
  hidden?: boolean;
  onChange: (items: string[], checked: boolean) => void;
}) {
  return (
    <fieldset id={id} className="quote-package-items" hidden={hidden}>
      <legend>{label}</legend>
      {items.map(item => (
        <label key={item}>
          <input type="checkbox" checked={selected.has(item)}
            onChange={event => onChange([item], event.target.checked)} />
          {item}
        </label>
      ))}
    </fieldset>
  );
}

export function QuoteRequestView() {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [search, setSearch] = useState("");
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [openPackages, setOpenPackages] = useState<Set<string>>(() => new Set());
  const [status, setStatus] = useState("");
  const [downloading, setDownloading] = useState(false);
  const query = normalize(search);
  const selection = groups.map(([name, items]): [string, string[]] => [
    name, items.filter(item => selected.has(item)),
  ]).filter(([, items]) => items.length);
  const visibleGroups = groups.map(([name, items], index) => ({
    name,
    index,
    items: normalize(name).includes(query) ? items : items.filter(item => normalize(item).includes(query)),
  })).filter(group => group.items.length);
  const count = number.format(selected.size);
  const identitySelectionCount = identityPackage.items.filter(item => selected.has(item)).length;

  function setPackageOpen(name: string, open: boolean) {
    setOpenPackages(current => {
      const updated = new Set(current);
      if (open) updated.add(name);
      else updated.delete(name);
      return updated;
    });
  }

  function updateSelection(items: string[], checked: boolean) {
    setSelected(current => {
      const updated = new Set(current);
      for (const item of items) {
        if (checked) updated.add(item);
        else updated.delete(item);
      }
      return updated;
    });
    setStatus("");
  }

  async function download() {
    setDownloading(true);
    try {
      const { downloadQuoteRequest } = await import("@/lib/quote-request-pdf");
      await downloadQuoteRequest(selection);
      setStatus("طلب التسعير جاهز في التنزيلات.");
    } catch {
      setStatus("التقرير ما اتنزّلش. جرّب تاني.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="quote-request">
      <div className="quote-hero">
        <div>
          <h1>محتاج تصمّم إيه؟</h1>
          <p>اختار الخدمات اللي محتاجها، ونزّل طلبك PDF وابعته على واتساب عشان نسعّره.</p>
          <a className="quote-start" href="#quote-services">اختار خدماتك <span aria-hidden="true">↓</span></a>
        </div>
        <img src="/media/services/visual-identity.webp" alt="" width={1200} height={900} />
      </div>

      <div className="quote-layout" id="quote-services">
        <div>
          <details className="quote-bundles">
            <summary>شوف الباقات الجاهزة</summary>
            <div className="quote-packages">
              {packages.map((pack, index) => {
                const active = pack.items.every(item => selected.has(item));
                const open = openPackages.has(pack.name);
                const panelId = `quote-package-${index}`;
                return (
                  <div className="quote-package" key={pack.name}>
                    <button type="button" aria-pressed={active} aria-expanded={open} aria-controls={panelId} onClick={() => {
                      setPackageOpen(pack.name, true);
                      updateSelection(pack.items, true);
                    }}>
                      <strong>{pack.name}</strong><small>{pack.detail}</small>
                      <span>{active ? "البنود مختارة ✓" : "اختار كل بنود الباقة +"}</span>
                    </button>
                    <PackageItems id={panelId} label={`بنود ${pack.name}`} items={pack.items}
                      selected={selected} hidden={!open} onChange={updateSelection} />
                  </div>
                );
              })}
            </div>
          </details>
          <section aria-labelledby="quote-services-title">
            <div className="quote-section-head">
              <h2 id="quote-services-title">الخدمات</h2>
              <input value={search} onChange={event => setSearch(event.target.value)} type="search"
                aria-label="ابحث عن خدمة" placeholder="ابحث عن خدمة… بوستر، بروشور" />
            </div>
            {!visibleGroups.length && <p role="status">مفيش خدمة مطابقة.</p>}
            {visibleGroups.map(({ name, index, items }) => {
              const expanded = Boolean(query) || openCategory === name;
              const panelId = `quote-category-${index}`;
              const hasIdentityDetails = openPackages.has(identityPackage.name) && items.includes(completeIdentityOption);
              const categoryItems = hasIdentityDetails
                ? items.filter(item => !identityPackage.items.includes(item))
                : items;
              return (
                <section className="quote-category" key={name}>
                  <h3>
                    <button type="button" aria-expanded={expanded} aria-controls={panelId} onClick={() => {
                      setSearch("");
                      setOpenCategory(expanded ? null : name);
                    }}>
                      <span><strong>{name}</strong><small>{categoryExamples[index]}</small></span>
                      <span className="quote-chevron" aria-hidden="true">⌄</span>
                    </button>
                  </h3>
                  <div className="quote-items" id={panelId} hidden={!expanded}>
                    {categoryItems.map(item => {
                      const isCompleteIdentity = item === completeIdentityOption;
                      const checked = isCompleteIdentity ? identitySelectionCount === identityPackage.items.length : selected.has(item);
                      return (
                        <div className="quote-item" key={item}>
                          <label>
                            <input type="checkbox" checked={checked}
                              ref={isCompleteIdentity ? input => {
                                if (input) input.indeterminate = identitySelectionCount > 0 && !checked;
                              } : undefined}
                              onChange={event => {
                                const include = event.target.checked;
                                if (isCompleteIdentity) setPackageOpen(identityPackage.name, include);
                                updateSelection(isCompleteIdentity ? identityPackage.items : [item], include);
                              }} />
                            {item}
                          </label>
                          {isCompleteIdentity && hasIdentityDetails && (
                            <PackageItems label="بنود الهوية" items={identityPackage.items}
                              selected={selected} onChange={updateSelection} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </section>
        </div>

        <aside className="quote-summary" id="quote-summary" aria-labelledby="quote-summary-title">
          <div className="quote-section-head">
            <h2 id="quote-summary-title">ملخّص اختياراتك</h2>
            {selected.size > 0 && <button className="quote-clear" type="button" onClick={() => {
              setOpenPackages(new Set());
              updateSelection([...selected], false);
            }}>امسح الكل</button>}
          </div>
          <p className="quote-muted" aria-live="polite">{selected.size ? `${count} من الخدمات مختارة` : "علّم على الخدمات اللي محتاجها."}</p>
          {selected.size > 0 && <ul>{selection.flatMap(([, items]) => items.map(item => <li key={item}>{item}</li>))}</ul>}
          <button className="quote-download" type="button" disabled={!selected.size || downloading} onClick={download}>
            {downloading ? "جاري تجهيز الملف…" : "نزّل طلب التسعير PDF ↓"}
          </button>
          {status && <p className="quote-muted" role="status">{status}</p>}
          {selected.size > 0 && (
            <>
              <a className="quote-whatsapp" href={whatsappUrl.href} target="_blank" rel="noopener noreferrer">افتح واتساب</a>
              <p className="quote-muted">ارفق ملف الـPDF في المحادثة عشان أراجع طلبك وأبعت لك السعر.</p>
            </>
          )}
        </aside>
      </div>
      {selected.size > 0 && <a className="quote-mobile-review" href="#quote-summary"><b>{count} خدمات مختارة</b><span>راجع طلبك ←</span></a>}
    </div>
  );
}
