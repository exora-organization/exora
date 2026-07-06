import { Alert, AlertTitle, AlertDescription } from "../ui/alert";

export function ExpiredInvitation() {
  return (
    <div className="flex h-screen items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertTitle>Invitation has expired</AlertTitle>
        <AlertDescription>Please contact your Company Owner for a new invitation.</AlertDescription>
      </Alert>
    </div>
  );
}
