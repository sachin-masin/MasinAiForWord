import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Button,
  Textarea,
  makeStyles,
  tokens,
  Card,
} from "@fluentui/react-components";
import { Send24Regular, Copy24Regular, Person24Regular } from "@fluentui/react-icons";
import { useAuth } from "../Auth/AuthProvider";
import { brandColors } from "../../theme/brandColors";
import { queryChatAPI } from "./utils/chatApi";
import { type StreamingResponse, type Citation } from "./utils/streamingResponseHandlers";
import MasinAiAvatar from "./MasinAiAvatar";
import { StreamingIndicator } from "./StreamingIndicator";
import { MarkdownRenderer } from "./MarkdownRenderer";

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Citation[];
  followUpQuestions?: string[];
  timestamp: Date;
  isStreaming?: boolean;
  status?: {
    status: string;
    message?: string;
  };
}

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: brandColors.offWhite,
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: tokens.spacingVerticalM,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    minHeight: 0,
  },
  messageWrapper: {
    display: 'flex',
    gap: tokens.spacingVerticalM,
    width: '100%',
  },
  userMessageWrapper: {
    flexDirection: 'row-reverse',
  },
  assistantMessageWrapper: {
    flexDirection: 'row',
  },
  avatarContainer: {
    flexShrink: 0,
    width: '40px',
    height: '40px',
  },
  userAvatar: {
    backgroundColor: brandColors.darkGreen,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  },
  messageContent: {
    flex: 1,
    minWidth: 0,
    maxWidth: '85%',
  },
  userMessageCard: {
    backgroundColor: brandColors.darkGreen,
    color: 'white',
    padding: tokens.spacingVerticalM,
    borderRadius: '16px 16px 4px 16px',
    wordBreak: 'break-word',
  },
  assistantMessageCard: {
    backgroundColor: 'white',
    padding: tokens.spacingVerticalM,
    borderRadius: '16px 16px 16px 4px',
    border: `1px solid ${brandColors.lightGray}`,
    boxShadow: `0 2px 8px rgba(35, 31, 32, 0.1)`,
    position: 'relative',
  },
  messageText: {
    fontSize: tokens.fontSizeBase400,
    lineHeight: tokens.lineHeightBase400,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  statusText: {
    fontSize: tokens.fontSizeBase200,
    color: brandColors.gray,
    fontStyle: 'italic',
    marginBottom: tokens.spacingVerticalXS,
  },
  inputContainer: {
    padding: tokens.spacingVerticalM,
    backgroundColor: 'white',
    borderTop: `1px solid ${brandColors.lightGray}`,
    display: 'flex',
    gap: tokens.spacingVerticalS,
    alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    minHeight: '60px',
    maxHeight: '120px',
    resize: 'none',
    fontSize: tokens.fontSizeBase400,
  },
  sendButton: {
    flexShrink: 0,
    minWidth: '48px',
    height: '48px',
    backgroundColor: brandColors.darkGreen,
    color: 'white',
    '&:hover': {
      backgroundColor: brandColors.darkGreenSecondary,
    },
    '&:disabled': {
      backgroundColor: brandColors.lightGray,
      color: brandColors.gray,
    },
  },
  copyButton: {
    position: 'absolute',
    top: tokens.spacingVerticalS,
    right: tokens.spacingVerticalS,
    minWidth: '32px',
    height: '32px',
    padding: 0,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: tokens.spacingVerticalXXL,
    textAlign: 'center',
    color: brandColors.gray,
  },
  emptyStateText: {
    fontSize: tokens.fontSizeBase500,
    marginTop: tokens.spacingVerticalM,
  },
  followUpContainer: {
    marginTop: tokens.spacingVerticalM,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  followUpTitle: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: brandColors.darkGreen,
    marginBottom: tokens.spacingVerticalXS,
  },
  followUpButton: {
    width: '100%',
    justifyContent: 'flex-start',
    textAlign: 'left',
    padding: tokens.spacingVerticalM,
    fontSize: tokens.fontSizeBase400,
    // borderColor: '#c0bdb9',
    color: '#231f20',
    '&:hover': {
      // borderColor: '#317c3b',
      backgroundColor: brandColors.offWhite,
    },
  },
});

export const ChatInterface: React.FC = () => {
  const styles = useStyles();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here if needed
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Create initial streaming message
    const streamingMessageId = crypto.randomUUID();
    const initialStreamingMessage: Message = {
      id: streamingMessageId,
      role: 'assistant',
      content: '',
      sources: [],
      followUpQuestions: [],
      timestamp: new Date(),
      isStreaming: true,
      status: {
        status: 'processing',
        message: 'Thinking...',
      },
    };

    setStreamingMessage(initialStreamingMessage);
    setMessages(prev => [...prev, initialStreamingMessage]);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 120000); // 2 minute timeout

      await queryChatAPI(
        { question: userMessage.content, sessionId, signal: controller.signal },
        {
          onUpdate: (data: Partial<StreamingResponse>) => {
            setStreamingMessage(prev => {
              if (!prev) return prev;

              const updated = { ...prev };
              if (data.answer !== undefined) {
                updated.content = data.answer;
              }
              if (data.followUpQuestions !== undefined) {
                updated.followUpQuestions = Array.isArray(data.followUpQuestions) ? data.followUpQuestions : [];
              }
              if (data.citations !== undefined) {
                updated.sources = data.citations;
              }
              if (data.status !== undefined) {
                updated.status = data.status;
              }
              if (data.sessionId !== undefined) {
                setSessionId(data.sessionId);
              }

              // Update the message in the messages array
              setMessages(prevMessages =>
                prevMessages.map(msg =>
                  msg.id === streamingMessageId ? updated : msg
                )
              );

              return updated;
            });
          },
          onComplete: async (data: StreamingResponse) => {
            clearTimeout(timeoutId);

            const finalMessage: Message = {
              id: streamingMessageId,
              role: 'assistant',
              content: data.answer || 'No response received',
              sources: data.citations || [],
              followUpQuestions: Array.isArray(data.followUpQuestions) && data.followUpQuestions.length > 0 
                ? data.followUpQuestions 
                : streamingMessage?.followUpQuestions || [],
              timestamp: new Date(),
              isStreaming: false,
            };

            if (data.sessionId) {
              setSessionId(data.sessionId);
            }

            setMessages(prevMessages =>
              prevMessages.map(msg =>
                msg.id === streamingMessageId ? finalMessage : msg
              )
            );

            setStreamingMessage(null);
          }
        }
      );
    } catch (error) {
      console.error('API endpoint error:', error);
      
      // Remove the streaming message on error
      setMessages(prev => prev.filter(msg => msg.id !== streamingMessageId));
      setStreamingMessage(null);

      // Add error message
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isStreaming: false,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, sessionId, streamingMessage]);

  const handleFollowUpClick = useCallback((question: string) => {
    setInput(question);
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <div className={styles.root}>
      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <MasinAiAvatar size={64} />
            <div className={styles.emptyStateText}>
              <p>Hello! I'm MasinAI. How can I help you today?</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isUser = message.role === 'user';
            const isLastMessage = index === messages.length - 1;
            const hasFollowUps = Array.isArray(message.followUpQuestions) && message.followUpQuestions.length > 0;
            const showFollowUps = !isUser && isLastMessage && hasFollowUps && !message.isStreaming;

            return (
              <div key={message.id}>
                <div className={`${styles.messageWrapper} ${isUser ? styles.userMessageWrapper : styles.assistantMessageWrapper}`}>
                  <div className={styles.avatarContainer}>
                    {isUser ? (
                      <div className={styles.userAvatar}>
                        <Person24Regular />
                      </div>
                    ) : (
                      <MasinAiAvatar size={40} />
                    )}
                  </div>
                  <div className={styles.messageContent}>
                    <Card className={isUser ? styles.userMessageCard : styles.assistantMessageCard}>
                      {!isUser && !message.isStreaming && (
                        <Button
                          className={styles.copyButton}
                          icon={<Copy24Regular />}
                          appearance="subtle"
                          size="small"
                          onClick={() => copyToClipboard(message.content)}
                          title="Copy message"
                        />
                      )}
                      
                      {message.status && message.isStreaming && message.status.message && (
                        <div className={styles.statusText}>
                          {message.status.message}
                        </div>
                      )}

                      {message.content && (
                        <div className={styles.messageText}>
                          {isUser ? (
                            <p style={{ color: 'white', margin: 0 }}>{message.content}</p>
                          ) : (
                            <MarkdownRenderer content={message.content} />
                          )}
                        </div>
                      )}

                      {message.isStreaming && (
                        <div style={{ marginTop: tokens.spacingVerticalS }}>
                          <StreamingIndicator size="sm" />
                        </div>
                      )}
                    </Card>

                    {showFollowUps && (
                      <div className={styles.followUpContainer}>
                        <div className={styles.followUpTitle}>Follow-up questions:</div>
                        {message.followUpQuestions?.map((question, qIndex) => (
                          <Button
                            key={qIndex}
                            className={styles.followUpButton}
                            appearance="outline"
                            onClick={() => handleFollowUpClick(question)}
                          >
                            {question}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputContainer}>
        <Textarea
          ref={textareaRef}
          className={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={isLoading}
          resize="vertical"
        />
        <Button
          className={styles.sendButton}
          icon={<Send24Regular />}
          onClick={handleSendMessage}
          disabled={!input.trim() || isLoading}
          appearance="primary"
        />
      </div>
    </div>
  );
};

