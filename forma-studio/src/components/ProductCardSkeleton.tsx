export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-black/10 bg-white">
      <div className="relative aspect-[4/5] bg-black/5">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-black/5 via-black/10 to-black/5" />
      </div>
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-black/10" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-black/10" />
        <div className="h-9 w-full animate-pulse rounded-2xl bg-black/10" />
      </div>
    </div>
  );
}