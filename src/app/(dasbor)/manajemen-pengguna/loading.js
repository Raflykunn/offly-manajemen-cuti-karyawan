import { Skeleton } from "@/components/ui/skeleton";

export default function MemuatManajemenPengguna() {
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-label="Memuat manajemen pengguna"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-8 w-36 rounded-lg" />
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <Skeleton className="lg:col-span-2 h-8 w-full rounded-lg" />
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
        <div className="space-y-3 pt-2">
          {Array.from({ length: 6 }).map((_, indeks) => (
            <Skeleton key={indeks} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
