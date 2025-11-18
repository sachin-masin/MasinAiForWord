/**
 * Streaming Response Handler
 * Handles Server-Sent Events (SSE) from /ask_stream endpoint
 */

import { parseFollowUpQuestions } from './followUpQuestions';

export interface Citation {
  id: string;
  source: string;
  excerpt: string;
}

// Interface for streaming response data
export interface StreamingResponse {
  sessionId?: string | null;
  answer: string;
  followUpQuestions?: string[];
  citations?: Citation[];
  status?: {
    status: string;
    message?: string;
  };
}

/**
 * Handler for streaming response from /ask_stream endpoint
 */
export const handleStreamingResponse = async (
  response: Response,
  onUpdate: (data: Partial<StreamingResponse>) => void,
  onComplete: (data: StreamingResponse) => void
): Promise<void> => {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body reader available');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let sessionId: string | null = null;
  let answer = '';
  let followUpQuestions: string[] = [];
  let citations: Citation[] = [];
  let currentEventType = '';
  let hasReceivedAnswer = false;

  try {
    while (true) {
      let result;
      try {
        result = await reader.read();
      } catch (readError) {
        console.warn('⚠️ Stream read error (connection may have closed):', readError);
        // If we have some content, consider it a partial success
        if (answer.trim()) {
          break;
        }
        throw readError;
      }

      const { done, value } = result;
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '') continue;

        if (line.startsWith('event:')) {
          currentEventType = line.substring(6).trim();
        } else if (line.startsWith('data:')) {
          const data = line.substring(5).trim();

          try {
            // Try to parse as JSON (new structured format)
            const jsonData = JSON.parse(data);

            if (jsonData.type === 'answer' && jsonData.delta === true) {
              // Clear status message text as soon as answer content starts arriving
              // Keep the status object so loading dots remain visible until streaming ends
              if (!hasReceivedAnswer) {
                hasReceivedAnswer = true;
                onUpdate({ 
                  status: { 
                    status: 'processing', 
                    message: '' 
                  } 
                });
              }
              answer += jsonData.content;
              onUpdate({ answer });
            }

            // Handle different event types
            switch (currentEventType) {
              case 'status':
                // Handle status/processing messages
                if (jsonData.status && jsonData.message) {
                  onUpdate({
                    status: {
                      status: jsonData.status,
                      message: jsonData.message
                    }
                  });
                }
                break;

              case 'session':
                // Handle session_id (can be null)
                if (jsonData.session_id !== undefined) {
                  sessionId = jsonData.session_id;
                  onUpdate({ sessionId });
                }
                break;

              case 'followup':
                if (jsonData.followup_questions) {
                  followUpQuestions = parseFollowUpQuestions(jsonData.followup_questions);
                  onUpdate({ followUpQuestions });
                }
                break;

              case 'citations':
                // Citations is an array
                if (Array.isArray(jsonData)) {
                  citations = jsonData.map((cite: any, index: number) => ({
                    id: `citation-${Date.now()}-${index}`,
                    source: cite.source || 'Unknown source',
                    excerpt: cite.excerpt || ''
                  }));
                  onUpdate({ citations });
                }
                break;

              case 'done':
                break;

              default:
                // Handle session_id in data without event type
                if (jsonData.session_id !== undefined) {
                  sessionId = jsonData.session_id;
                  onUpdate({ sessionId });
                }
                break;
            }
          } catch (parseError) {
            console.warn('Failed to parse data line:', data, parseError);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Streaming error:', error);
    // If we have partial content, don't throw - let it complete with what we have
    if (!answer.trim()) {
      throw error;
    }
  } finally {
    try {
      reader.releaseLock();
    } catch (releaseError) {
      console.warn('⚠️ Error releasing stream reader:', releaseError);
    }
  }

  // Call completion handler with final data
  onComplete({
    sessionId,
    answer: answer.trim(),
    followUpQuestions,
    citations
  });
};

