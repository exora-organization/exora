import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">401 - Unauthorized</h2>
      <p>You must be logged in to access this page.</p>
      <Link href="/login" className="px-4 py-2 bg-blue-500 text-white rounded-md">
        Go to Login
      </Link>
    </div>
  );
}
