/**
 * API Configuration for Chat
 * Backend URL configuration for MasinAI chat API
 */

export const getBackendUrl = (): string => {
  // Use the dev-ai.masinai.net backend
  return 'https://dev-ai.masinai.net';
};

/**
 * Configuration object for API settings
 */
export const apiConfig = {
  get baseUrl(): string {
    return getBackendUrl();
  },
  
  // Timeout settings
  timeout: 120000, // 2 minutes for streaming responses
};

