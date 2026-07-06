export interface DocumentListItem {
  documentId: string;
  caseId: string;
  documentType: string;
  filename: string;
  downloadUrl: string;
  generatedAt: string;
}

export interface DocumentListResponse {
  caseId: string;
  items: DocumentListItem[];
}

export interface GenerateDocumentResponse {
  documentId: string;
  caseId: string;
  documentType: string;
  filename: string;
  downloadUrl: string;
  generatedAt: string;
}
