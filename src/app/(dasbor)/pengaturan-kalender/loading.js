import { Skeleton } from "@/components/ui/skeleton";

export default function MemuatPengaturanKalender() {
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-label="Memuat pengaturan kalender"
    >
      <div className="space-y-2">
        <Skeleton className="h-7 w-80 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <Skeleton className="h-9 w-96 max-w-full rounded-lg" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 rounded-xl border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
        <div className="lg:col-span-8 rounded-xl border bg-card p-6 space-y-3">
          <Skeleton className="h-6 w-56" />
          {Array.from({ length: 5 }).map((_, indeks) => (
            <Skeleton key={indeks} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
