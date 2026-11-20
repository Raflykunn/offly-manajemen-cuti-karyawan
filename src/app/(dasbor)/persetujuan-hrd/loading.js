import { Skeleton } from "@/components/ui/skeleton";

export default function MemuatPersetujuanHrd() {
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-label="Memuat persetujuan HRD"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-44 rounded-lg" />
        </div>
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, indeks) => (
          <div
            key={indeks}
            className="rounded-xl border bg-card p-5 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-4 rounded" />
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-52" />
                </div>
              </div>
              <Skeleton className="h-6 w-36 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-32 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
