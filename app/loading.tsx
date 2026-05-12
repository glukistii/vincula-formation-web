export default function Loading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-neutral-500">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-brand" />
      <p className="text-sm">Chargement…</p>
    </div>
  );
}
