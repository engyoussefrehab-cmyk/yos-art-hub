import { useState } from "react";
import { must, supabase } from "../lib/supabase";
import { useData } from "../lib/useData";
import { CURRENCIES, money } from "../lib/format";
import type { Service } from "../lib/types";
import { Async, Badge, Button, Empty, Modal, PageHeader, RecordForm, Table, confirmDelete, type FieldDef } from "../ui";

const FIELDS: FieldDef[] = [
  { name: "name", label: "Name", required: true, full: true },
  { name: "default_price", label: "Default price", type: "number" },
  { name: "currency", label: "Currency", type: "select", options: CURRENCIES.map((c) => ({ value: c, label: c })), required: true },
  { name: "delivery_days", label: "Estimated delivery (days)", type: "number", step: "1" },
  { name: "sort", label: "Order", type: "number", step: "1" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "deliverables", label: "Deliverables (one per line)", type: "textarea" },
  { name: "active", label: "Active (shown in the inquiry form and quotation picker)", type: "checkbox", full: true },
];

export function Services() {
  const [editing, setEditing] = useState<Partial<Service> | null>(null);
  const state = useData(() => must(supabase.from("services").select("*").order("sort").order("name")));

  return (
    <>
      <PageHeader
        title="Services"
        sub="Prices are yours to set — nothing is hard-coded."
        actions={<Button kind="primary" onClick={() => setEditing({ currency: "USD", active: true })}>+ New service</Button>}
      />
      <Async state={state}>
        {(rows) =>
          rows.length === 0 ? (
            <Empty title="No services yet" />
          ) : (
            <Table head={["Service", "Default price", "Delivery", "Status", ""]}>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="font-medium">{s.name}</div>
                    {s.description && <div className="max-w-md truncate text-xs text-muted">{s.description}</div>}
                  </td>
                  <td className="text-muted">{s.default_price == null ? "Not set" : money(s.default_price, s.currency)}</td>
                  <td className="text-muted">{s.delivery_days == null ? "—" : `${s.delivery_days} days`}</td>
                  <td>{s.active ? <Badge value="completed" label="Active" /> : <Badge value="draft" label="Hidden" />}</td>
                  <td className="text-right">
                    <Button small onClick={() => setEditing(s)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          )
        }
      </Async>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit service" : "New service"}>
        {editing && (
          <>
            <RecordForm
              fields={FIELDS}
              initial={editing as Record<string, unknown>}
              onCancel={() => setEditing(null)}
              onSubmit={async (v) => {
                const row = { ...v, sort: v.sort ?? 0 };
                if (editing.id) await must(supabase.from("services").update(row).eq("id", editing.id));
                else await must(supabase.from("services").insert(row));
                setEditing(null);
                state.reload();
              }}
            />
            {editing.id && (
              <Button
                small
                kind="danger"
                className="mt-2"
                onClick={async () => {
                  if (!confirmDelete(editing.name ?? "this service")) return;
                  await must(supabase.from("services").delete().eq("id", editing.id!));
                  setEditing(null);
                  state.reload();
                }}
              >
                Delete service
              </Button>
            )}
          </>
        )}
      </Modal>
    </>
  );
}
