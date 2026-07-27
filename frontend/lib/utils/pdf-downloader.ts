import { toast } from "sonner";
import { auth } from "../firebase/client";

/**
 * Downloads a generated PDF document directly from backend /documents/{documentId}/download endpoint.
 */
export async function downloadDocument(documentId: string, filename: string): Promise<boolean> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/v1";
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;

    const res = await fetch(`${API_BASE_URL}/documents/${documentId}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
      throw new Error(`Download failed with status ${res.status}`);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`"${filename}" downloaded successfully!`);
    return true;
  } catch (err: any) {
    toast.error(err.message || "Failed to download document.");
    return false;
  }
}
