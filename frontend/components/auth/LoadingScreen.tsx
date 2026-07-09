import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
        <p className="text-lg font-medium text-gray-700">Loading EXORA...</p>
      </div>
    </div>
  );
}
