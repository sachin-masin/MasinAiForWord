import { getBackendUrl } from './apiConfig';
import { handleStreamingResponse, type StreamingResponse } from './streamingResponseHandlers';

interface QueryApiOptions {
  question: string;
  documentContext?: string | null;
  selectedContentContext?: string | null;
  modelName?: string;
  documentIds?: string[];
  previousContext?: string;
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
  const { question } = options;
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
      model_name: options.modelName || 'gpt-5.2',
      document_ids: options.documentIds || [],
      previous_context: options.previousContext || '[]',
      source: 'word_plugin',
      ...(options.documentContext && { document_context: options.documentContext }),
      ...(options.selectedContentContext && { selected_content_context: options.selectedContentContext }),
    }),
  });

  if (!response.ok) {
    throw new Error(`API endpoint failed: ${response.statusText}`);
  }

  // use handleStreamingResponse for 
  await handleStreamingResponse(response, onUpdate, onComplete);
}

/**
 * Upload local files to the backend `/upload` endpoint.
 */
export async function uploadFiles(files: FileList): Promise<{ message: string; session_id?: string; doc_ids?: string[]; status?: string }> {
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

/**
 * The backend now supports implicit conversation creation via `/ask_stream`.
 * Use this only if explicit creation is required for specific flows.
 */
export async function createConversation(opts?: { title?: string; documentSessionId?: string; source?: string; }): Promise<{ session_id?: string }> {
  const baseUrl = getBackendUrl();
  try {
    const res = await fetch(`${baseUrl}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: opts?.title || 'Word Conversation',
        document_session_id: opts?.documentSessionId,
        source: opts?.source || 'word_plugin',
      }),
    });
    if (!res.ok) throw new Error(`Create conversation failed: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('createConversation error', err);
    throw err;
  }
}

// Fetch conversation details/messages
export async function getConversation(sessionId: string): Promise<any> {
  const baseUrl = getBackendUrl();
  const res = await fetch(`${baseUrl}/conversations/${encodeURIComponent(sessionId)}`);
  if (!res.ok) throw new Error(`Get conversation failed: ${res.statusText}`);
  return await res.json();
}
