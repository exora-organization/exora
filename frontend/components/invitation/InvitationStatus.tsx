import { Alert, AlertTitle, AlertDescription } from "../ui/alert";

export function InvitationStatus({ status, error }: { status: "accepted" | "invalid" | "network_error", error?: string }) {
  if (status === "accepted") {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertTitle>Already Accepted</AlertTitle>
          <AlertDescription>This invitation has already been accepted.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Invalid Invitation</AlertTitle>
          <AlertDescription>Invalid invitation link.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertTitle>Network Error</AlertTitle>
        <AlertDescription>{error || "Unable to fetch invitation details."}</AlertDescription>
      </Alert>
    </div>
  );
}
