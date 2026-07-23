"use client";

export function TabSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-[#E8E3D9] shadow-sm rounded-3xl p-6 md:p-8 space-y-6 animate-pulse my-4">
      <div className="flex items-center justify-between">
        <div className="h-6 w-48 bg-gray-200 rounded-xl" />
        <div className="h-8 w-24 bg-gray-200 rounded-xl" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl p-4 space-y-2">
            <div className="h-3 w-16 bg-gray-200 rounded" />
            <div className="h-6 w-24 bg-gray-300 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="h-32 bg-gray-100 rounded-2xl w-full" />
    </div>
  );
}
