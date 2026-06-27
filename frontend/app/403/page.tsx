import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">403 - Forbidden</h2>
      <p>You do not have permission to access this resource.</p>
      <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded-md">
        Return Home
      </Link>
    </div>
  );
}
