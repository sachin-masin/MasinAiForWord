import { getBackendUrl } from './apiConfig';
import { handleStreamingResponse, type StreamingResponse } from './streamingResponseHandlers';

interface QueryApiOptions {
  question: string;
  sessionId?: string | null;
  documentContext?: string | null;
  selectedContentContext?: string | null;
  signal?: AbortSignal;
}

interface StreamingCallbacks {
  onUpdate: (data: Partial<StreamingResponse>) => void;
  onComplete: (data: StreamingResponse) => Promise<void>;
}

/**
 * Makes an API call to /ask_stream endpoint
 */
export async function queryChatAPI(
  options: QueryApiOptions,
  callbacks: StreamingCallbacks
): Promise<void> {
  const { question, sessionId, signal } = options;
  const { onUpdate, onComplete } = callbacks;

  const baseUrl = getBackendUrl();

  // use /ask_stream endpoint
  const response = await fetch(`${baseUrl}/ask_stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question,
      ...(sessionId && { session_id: sessionId }),
      ...(options.documentContext && { document_context: options.documentContext }),
      ...(options.selectedContentContext && { selected_content_context: options.selectedContentContext }),
    }),
    ...(signal && { signal })
  });

  if (!response.ok) {
    throw new Error(`API endpoint failed: ${response.statusText}`);
  }

  // use handleStreamingResponse for 
  await handleStreamingResponse(response, onUpdate, onComplete);
}

/**
 * Upload local files to the backend `/upload` endpoint.
 * Returns parsed JSON which should include `session_id` when successful.
 */
export async function uploadFiles(files: FileList): Promise<{ message: string; session_id?: string; status?: string }> {
  const baseUrl = getBackendUrl();

  const form = new FormData();
  Array.from(files).forEach((file) => {
    form.append('files', file, file.name);
  });

  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

