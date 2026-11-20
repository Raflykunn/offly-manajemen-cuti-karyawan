import { Skeleton } from "@/components/ui/skeleton";

export default function MemuatHalaman() {
  return (
    <main
      className="flex min-h-screen flex-1 items-center justify-center bg-background px-4 py-12"
      aria-busy="true"
      aria-label="Memuat halaman"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-xl shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3.5 w-52" />
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </main>
  );
}
