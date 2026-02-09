import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TodoManager } from "@/components/dashboard/todo-manager";

export default async function TodosPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: todos } = await supabase
    .from("todos")
    .select("id, title, description, category, priority, due_date, is_completed")
    .eq("user_id", user.id)
    .order("is_completed", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  return <TodoManager todos={todos || []} userId={user.id} />;
}
