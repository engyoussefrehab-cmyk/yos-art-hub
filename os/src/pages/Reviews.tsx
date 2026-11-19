import { must, supabase } from "../lib/supabase";
import { useData } from "../lib/useData";
import { Async, Badge, Button, Empty, PageHeader, Table, confirmDelete } from "../ui";

type Review = {
  id: string;
  name: string;
  project: string | null;
  text: string;
  rating: number;
  is_visible: boolean;
  created_at: string;
};

/** Client reviews from yrstudio.art/review. Only approved ones show on the site. */
export function Reviews() {
  const state = useData(() =>
    must(supabase.from("reviews").select("*").order("is_visible").order("created_at", { ascending: false })),
  ) as ReturnType<typeof useData<Review[]>>;

  const setVisible = async (id: string, v: boolean) => {
    await must(supabase.from("reviews").update({ is_visible: v }).eq("id", id));
    state.reload();
  };

  return (
    <>
      <PageHeader title="Reviews" sub="New reviews wait here. Approve to show them on yrstudio.art." />
      <Async state={state}>
        {(rows: Review[]) =>
          rows.length === 0 ? (
            <Empty title="No reviews yet" />
          ) : (
            <Table head={["Client", "Review", "Status", ""]}>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="align-top">
                    <div className="font-medium">{r.name}</div>
                    {r.project && <div className="text-xs text-muted">{r.project}</div>}
                    <div className="text-xs text-muted">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                  </td>
                  <td className="max-w-lg whitespace-pre-wrap align-top" dir="auto">{r.text}</td>
                  <td className="align-top">
                    {r.is_visible ? <Badge value="completed" label="Published" /> : <Badge value="draft" label="Pending" />}
                  </td>
                  <td className="whitespace-nowrap text-right align-top">
                    {r.is_visible ? (
                      <Button small onClick={() => setVisible(r.id, false)}>Hide</Button>
                    ) : (
                      <Button small kind="primary" onClick={() => setVisible(r.id, true)}>Approve</Button>
                    )}{" "}
                    <Button
                      small
                      kind="danger"
                      onClick={async () => {
                        if (!confirmDelete(`the review from ${r.name}`)) return;
                        await must(supabase.from("reviews").delete().eq("id", r.id));
                        state.reload();
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          )
        }
      </Async>
    </>
  );
}
