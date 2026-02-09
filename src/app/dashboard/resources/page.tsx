import { createClient } from "@/lib/supabase/server";
import { ResourceList } from "@/components/dashboard/resource-list";

export default async function ResourcesPage() {
  const supabase = createClient();

  const { data: resources } = await supabase
    .from("resources")
    .select("id, name, description, category, location, phone, email, website, hours, icon")
    .order("name", { ascending: true });

  return (
    <>
      {/* Page Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-maroon-950 sm:text-3xl">
          Campus Resources
        </h1>
        <p className="mt-1 text-surface-600">
          Every office, service, and support center in one place
        </p>
      </header>

      <ResourceList resources={resources || []} />
    </>
  );
}
