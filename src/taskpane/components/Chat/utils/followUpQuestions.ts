/**
 * Utility function to parse follow-up questions from different formats
 * Handles both array format and string format with numbered items and bold titles
 */
export const parseFollowUpQuestions = (followUp: string | string[] | undefined): string[] => {
  if (!followUp) return [];
  
  if (Array.isArray(followUp)) {
    return followUp;
  }
  
  if (typeof followUp === 'string') {
    // Handle different formats of follow-up questions
    
    // Format 1: Numbered questions with bold titles like "1. **Title**: Question text"
    if (followUp.includes('**') && followUp.includes(':')) {
      return followUp
        .split(/\d+\.\s*\*\*.*?\*\*:/)
        .filter(question => question.trim().length > 0)
        .map(question => question.trim().replace(/^\d+\.\s*/, ''))
        .filter(question => question.length > 0);
    }
    
    // Format 2: Simple numbered questions like "1. Question text\n2. Question text"
    if (followUp.match(/^\d+\./)) {
      return followUp
        .split(/\n(?=\d+\.)/)
        .map(question => question.trim().replace(/^\d+\.\s*/, ''))
        .filter(question => question.length > 0);
    }
    
    // Format 3: Questions separated by newlines (fallback)
    return followUp
      .split('\n')
      .map(question => question.trim())
      .filter(question => question.length > 0);
  }
  
  return [];
};

