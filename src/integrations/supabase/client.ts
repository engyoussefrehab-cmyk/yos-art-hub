// Static site: this client reads the JSON snapshot in src/data/snapshot.
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient("static", "static");
