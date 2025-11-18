import { getBackendUrl } from './apiConfig';
import { handleStreamingResponse, type StreamingResponse } from './streamingResponseHandlers';

interface QueryApiOptions {
  question: string;
  sessionId?: string | null;
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
      ...(sessionId && { session_id: sessionId })
    }),
    ...(signal && { signal })
  });

  if (!response.ok) {
    throw new Error(`API endpoint failed: ${response.statusText}`);
  }

  // use handleStreamingResponse for /ask_stream
  await handleStreamingResponse(response, onUpdate, onComplete);
}

