import { getSession } from "@/lib/auth";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <p className="text-muted-foreground">Coming soon in the next phase.</p>
    </div>
  );
}

export default async function GalleryPage() {
  await getSession();
  return <PlaceholderPage title="Gallery" />;
}
