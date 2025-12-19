import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Button,
  Textarea,
  makeStyles,
  tokens,
  Card,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
} from "@fluentui/react-components";
import {
  Send24Regular,
  Copy24Regular,
  Person24Regular,
  Edit24Regular,
  Dismiss12Regular,
} from "@fluentui/react-icons";
import { useAuth } from "../Auth/AuthProvider";
import { brandColors } from "../../theme/brandColors";
import { queryChatAPI, uploadFiles } from "./utils/chatApi";
import { type StreamingResponse, type Citation } from "./utils/streamingResponseHandlers";
import MasinAiAvatar from "./MasinAiAvatar";
import { StreamingIndicator } from "./StreamingIndicator";
import { MarkdownRenderer } from "./MarkdownRenderer";

export interface Message {
  id: string;
  role: "user" | "assistant";
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
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: brandColors.offWhite,
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: tokens.spacingVerticalXS,
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
    minHeight: 0,
  },
  messageWrapper: {
    display: "flex",
    gap: tokens.spacingVerticalM,
    width: "100%",
  },
  userMessageWrapper: {
    flexDirection: "row-reverse",
  },
  assistantMessageWrapper: {
    flexDirection: "row",
  },
  messageContent: {
    flex: 1,
    minWidth: 0,
    maxWidth: "85%",
  },
  userMessageCard: {
    backgroundColor: brandColors.darkGreen,
    color: "white",
    padding: tokens.spacingVerticalM,
    borderRadius: "8px",
    wordBreak: "break-word",
  },
  assistantMessageCard: {
    backgroundColor: "white",
    padding: tokens.spacingVerticalM,
    borderRadius: "8px",
    border: `1px solid ${brandColors.lightGray}`,
    position: "relative",
  },
  messageText: {
    fontSize: tokens.fontSizeBase400,
    lineHeight: tokens.lineHeightBase400,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  statusText: {
    fontSize: tokens.fontSizeBase200,
    color: brandColors.gray,
    fontStyle: "italic",
    marginBottom: tokens.spacingVerticalXS,
  },
  inputContainer: {
    padding: tokens.spacingVerticalM,
    backgroundColor: "white",
    borderTop: `1px solid ${brandColors.lightGray}`,
    display: "flex",
    gap: tokens.spacingVerticalS,
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftControls: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingHorizontalS,
    alignItems: "center",
    position: "absolute",
    left: tokens.spacingHorizontalM,
    bottom: tokens.spacingVerticalM,
  },
  modeIcon: {
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: brandColors.darkGreen,
  },
  select: {
    padding: `4px 8px`,
    borderRadius: "6px",
    border: `1px solid ${brandColors.lightGray}`,
    background: "white",
    color: "#231f20",
    fontSize: tokens.fontSizeBase400,
    outline: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
  },
  selectOption: {
    background: "white",
    color: "#231f20",
    fontSize: tokens.fontSizeBase400,
    width: "40px",
    minWidth: "40px",
    maxWidth: "40px",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  controls: {
    display: "flex",
    gap: tokens.spacingHorizontalS,
    alignItems: "center",
  },
  uploadInput: {
    display: "none",
  },
  textarea: {
    flex: 1,
    paddingLeft: "48px",
    minHeight: "70px",
    height: "70px",
    maxHeight: "70px",
    resize: "none",
    fontSize: tokens.fontSizeBase400,
    width: "100%",
  },
  sendButton: {
    flexShrink: 0,
    minWidth: "48px",
    height: "48px",
    backgroundColor: brandColors.darkGreen,
    color: "white",
    "&:hover": {
      backgroundColor: brandColors.darkGreenSecondary,
    },
    "&:disabled": {
      backgroundColor: brandColors.lightGray,
      color: brandColors.gray,
    },
  },
  copyButton: {
    position: "absolute",
    top: tokens.spacingVerticalS,
    right: tokens.spacingVerticalS,
    minWidth: "32px",
    height: "32px",
    padding: 0,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: tokens.spacingVerticalXXL,
    textAlign: "center",
    color: brandColors.gray,
  },
  emptyStateText: {
    fontSize: tokens.fontSizeBase500,
    marginTop: tokens.spacingVerticalXS,
  },
  followUpContainer: {
    marginTop: tokens.spacingVerticalM,
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },

  followUpButton: {
    width: "100%",
    justifyContent: "flex-start",
    textAlign: "left",
    padding: tokens.spacingVerticalM,
    fontSize: tokens.fontSizeBase400,
    borderRadius: "6px",
    backgroundColor: "white",
    color: "#231f20",
    "&:hover": {
      backgroundColor: brandColors.offWhite,
      border: `1px solid ${brandColors.lightGray}`,
    },
  },
});

export const ChatInterface: React.FC = () => {
  const styles = useStyles();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [mode, setMode] = useState<"draft" | "edit">("draft");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ name: string; type: string; size: number; content?: string }>
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [isAnyMessageStreaming, setIsAnyMessageStreaming] = useState(false);

  // Track whether any message is currently streaming (used by input controls)
  useEffect(() => {
    setIsAnyMessageStreaming(Boolean(streamingMessage) || messages.some((m) => m.isStreaming));
  }, [streamingMessage, messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here if needed
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, []);

  const setMessageRef = useCallback((id: string, el: HTMLDivElement | null) => {
    messageRefs.current[id] = el;
  }, []);

  const insertTextAtCursor = useCallback(async (text: string) => {
    try {
      return await new Promise<void>((resolve) => {
        try {
          // Try Office API first
          if (typeof Office !== "undefined" && Office.context && Office.context.document) {
            Office.context.document.setSelectedDataAsync(
              text,
              { coercionType: Office.CoercionType.Text },
              (result: any) => {
                if (result && result.status === Office.AsyncResultStatus.Succeeded) {
                  resolve();
                } else {
                  resolve();
                }
              }
            );
          } else {
            // If Office API not available, try clipboard + paste fallback (best-effort)
            navigator.clipboard
              .writeText(text)
              .then(() => resolve())
              .catch(() => resolve());
          }
        } catch (e) {
          console.warn("Insert fallback failed", e);
          resolve();
        }
      });
    } catch (e) {
      console.warn("insertTextAtCursor error", e);
    }
  }, []);

  // Utility: get selected text (Office Common API)
  const getSelectionText = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      try {
        Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, (result: any) => {
          if (result && result.status === Office.AsyncResultStatus.Succeeded) {
            resolve(result.value || "");
          } else {
            resolve("");
          }
        });
      } catch (e) {
        console.warn("getSelectedDataAsync failed", e);
        resolve("");
      }
    });
  }, []);

  // Utility: get full document text (Word JavaScript API). Falls back to empty string
  // if Word API is not available or fails. Keep this operation guarded because
  // it can be heavy for very large docs.
  const getFullDocumentText = useCallback(async (): Promise<string> => {
    try {
      // `Word` is available in Word-hosted taskpane contexts
      if (typeof (window as any).Word !== "undefined" && (window as any).Word.run) {
        // Use Word.run to read the document body text
        return await (window as any).Word.run(async (context: any) => {
          const body = context.document.body;
          body.load("text");
          await context.sync();
          return body.text || "";
        });
      }
    } catch (e) {
      console.warn("Word.run failed to get full document text", e);
    }

    // Fallback: return empty string when full document text cannot be obtained.
    return "";
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Create initial streaming message
    const streamingMessageId = crypto.randomUUID();
    const initialStreamingMessage: Message = {
      id: streamingMessageId,
      role: "assistant",
      content: "",
      sources: [],
      followUpQuestions: [],
      timestamp: new Date(),
      isStreaming: true,
      status: {
        status: "processing",
        message: "Thinking...",
      },
    };

    setStreamingMessage(initialStreamingMessage);
    setMessages((prev) => [...prev, initialStreamingMessage]);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 120000); // 2 minute timeout

      const MAX_CONTEXT_CHARS = 15000;
      const [selectedText, fullDocText] = await Promise.all([
        getSelectionText(),
        getFullDocumentText(),
      ]);

      const selectedContext = selectedText ? selectedText.slice(0, MAX_CONTEXT_CHARS) : null;
      const documentContext = fullDocText ? fullDocText.slice(0, MAX_CONTEXT_CHARS) : null;

      await queryChatAPI(
        {
          question: userMessage.content,
          sessionId,
          signal: controller.signal,
          documentContext,
          selectedContentContext: selectedContext,
        },
        {
          onUpdate: (data: Partial<StreamingResponse>) => {
            setStreamingMessage((prev) => {
              if (!prev) return prev;

              const updated = { ...prev };
              if (data.answer !== undefined) {
                updated.content = data.answer;
              }
              if (data.followUpQuestions !== undefined) {
                updated.followUpQuestions = Array.isArray(data.followUpQuestions)
                  ? data.followUpQuestions
                  : [];
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
              setMessages((prevMessages) =>
                prevMessages.map((msg) => (msg.id === streamingMessageId ? updated : msg))
              );

              return updated;
            });
          },
          onComplete: async (data: StreamingResponse) => {
            clearTimeout(timeoutId);

            const finalMessage: Message = {
              id: streamingMessageId,
              role: "assistant",
              content: data.answer || "No response received",
              sources: data.citations || [],
              followUpQuestions:
                Array.isArray(data.followUpQuestions) && data.followUpQuestions.length > 0
                  ? data.followUpQuestions
                  : streamingMessage?.followUpQuestions || [],
              timestamp: new Date(),
              isStreaming: false,
            };

            if (data.sessionId) {
              setSessionId(data.sessionId);
            }

            setMessages((prevMessages) =>
              prevMessages.map((msg) => (msg.id === streamingMessageId ? finalMessage : msg))
            );

            setStreamingMessage(null);

            // If in edit mode, automatically apply the full response into the document
            try {
              if (mode === "edit" && data.answer) {
                await insertTextAtCursor(data.answer);
              }
            } catch (e) {
              console.warn("Auto-insert failed", e);
            }
          },
        }
      );
    } catch (error) {
      console.error("API endpoint error:", error);

      // Remove the streaming message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== streamingMessageId));
      setStreamingMessage(null);

      // Add error message
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        isStreaming: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, sessionId, streamingMessage, mode, insertTextAtCursor]);

  const handleFollowUpClick = useCallback((question: string) => {
    setInput(question);
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const applySelectionToDocument = useCallback(
    async (messageId: string, fallbackContent: string) => {
      try {
        const messageEl = messageRefs.current[messageId];
        const sel = window.getSelection?.();
        let text = "";
        if (
          sel &&
          sel.toString().trim() &&
          messageEl &&
          sel.anchorNode &&
          messageEl.contains(sel.anchorNode)
        ) {
          text = sel.toString();
        } else {
          text = fallbackContent || "";
        }

        if (text && text.trim()) {
          await insertTextAtCursor(text);
        }
      } catch (e) {
        console.warn("Apply selection failed", e);
      }
    },
    [insertTextAtCursor]
  );

  const applyAllToDocument = useCallback(
    async (content: string) => {
      if (!content) return;
      try {
        await insertTextAtCursor(content);
      } catch (e) {
        console.warn("Apply all failed", e);
      }
    },
    [insertTextAtCursor]
  );

  const handleUploadFilesChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      // Read `.txt` files client-side so we can display them inline
      const fileArray = Array.from(files);
      const readPromises = fileArray.map((file) => {
        const meta = { name: file.name, type: file.type, size: file.size };
        if (file.type.startsWith("text") || file.name.toLowerCase().endsWith(".txt")) {
          return new Promise<{ name: string; type: string; size: number; content?: string }>(
            (res) => {
              const reader = new FileReader();
              reader.onload = () => {
                res({ ...meta, content: String(reader.result || "") });
              };
              reader.onerror = () => res(meta);
              reader.readAsText(file);
            }
          );
        }
        return Promise.resolve<{ name: string; type: string; size: number; content?: string }>(
          meta
        );
      });

      const readResults = await Promise.all(readPromises);
      setUploadedFiles((prev) => [...prev, ...readResults]);

      const data = await uploadFiles(files);
      if (data.session_id) {
        setSessionId(data.session_id);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
      // reset input so same file can be uploaded again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, []);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

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
            const isUser = message.role === "user";
            const isLastMessage = index === messages.length - 1;
            const hasFollowUps =
              Array.isArray(message.followUpQuestions) && message.followUpQuestions.length > 0;
            const showFollowUps = !isUser && isLastMessage && hasFollowUps && !message.isStreaming;

            return (
              <div key={message.id}>
                <div
                  className={`${styles.messageWrapper} ${isUser ? styles.userMessageWrapper : styles.assistantMessageWrapper}`}
                >
                  {isUser ? (
                    <></>
                  ) : (
                    <div style={{ minWidth: "24px", minHeight: "24px" }}>
                      <MasinAiAvatar size={24} />
                    </div>
                  )}
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
                        <div className={styles.statusText}>{message.status.message}</div>
                      )}

                      {message.content && (
                        <div
                          className={styles.messageText}
                          ref={(el) => setMessageRef(message.id, el)}
                        >
                          {isUser ? (
                            <p style={{ color: "white", margin: 0 }}>{message.content}</p>
                          ) : (
                            <MarkdownRenderer content={message.content} />
                          )}
                        </div>
                      )}

                      {/* Draft-mode controls: allow applying selected or whole answer into the document */}
                      {!isUser && !message.isStreaming && mode === "draft" && (
                        <div
                          style={{
                            marginTop: tokens.spacingVerticalS,
                            display: "flex",
                            gap: tokens.spacingHorizontalS,
                          }}
                        >
                          <Button
                            size="small"
                            appearance="primary"
                            onClick={() => applySelectionToDocument(message.id, message.content)}
                          >
                            Apply selection
                          </Button>
                          <Button
                            size="small"
                            appearance="subtle"
                            onClick={() => applyAllToDocument(message.content)}
                          >
                            Apply all
                          </Button>
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: tokens.spacingHorizontalS,
            flex: 1,
            position: "relative",
            height: "70px",
          }}
        >
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
          <div className={styles.leftControls}>
            <Menu>
              <MenuTrigger>
                <Button
                  appearance="outline"
                  className={styles.select}
                  aria-label="Mode"
                  size="small"
                  style={{
                    pointerEvents: isAnyMessageStreaming ? "none" : "auto",
                    cursor: isAnyMessageStreaming ? "not-allowed" : "default",
                    border: "1px solid #242424",
                    width: "40px",
                    minWidth: "40px",
                    maxWidth: "40px",
                    padding: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <span className={styles.modeIcon} aria-hidden>
                    {mode === "draft" ? <Person24Regular /> : <Edit24Regular />}
                  </span>
                </Button>
              </MenuTrigger>
              <MenuPopover style={{ width: "40px", maxWidth: "40px" }}>
                <MenuList style={{ width: "40px", maxWidth: "40px" }}>
                  <MenuItem
                    className={styles.selectOption}
                    onClick={() => setMode("draft")}
                    style={{ width: "40px" }}
                  >
                    <Person24Regular style={{ width: "40px" }} />
                  </MenuItem>
                  <MenuItem
                    className={styles.selectOption}
                    onClick={() => setMode("edit")}
                    style={{ width: "40px" }}
                  >
                    <Edit24Regular style={{ width: "40px" }} />
                  </MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>

            <div>
              <input
                ref={(el) => (fileInputRef.current = el)}
                className={styles.uploadInput}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/png,text/plain"
                onChange={handleUploadFilesChange}
                style={{
                  pointerEvents: isAnyMessageStreaming ? "none" : "auto",
                  cursor: isAnyMessageStreaming ? "not-allowed" : "default",
                }}
              />
              <Button
                onClick={openFileDialog}
                appearance="subtle"
                disabled={isUploading}
                size="small"
                style={{
                  pointerEvents: isAnyMessageStreaming ? "none" : "auto",
                  cursor: isAnyMessageStreaming ? "not-allowed" : "default",
                  border: "1px solid #242424",
                  width: "40px",
                  minWidth: "40px",
                  maxWidth: "40px",
                  padding: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                +
              </Button>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {uploadedFiles.length > 0 && (
            <Menu>
              <MenuTrigger>
                <Button
                  appearance="subtle"
                  size="small"
                  title={uploadedFiles
                    .map((f) => `${f.name} (${Math.round((f.size / 1024) * 1024)} MB)`)
                    .join("\n")}
                  style={{
                    border: "1px solid #242424",
                    minWidth: 48,
                    width: 48,
                    height: 16,
                    minHeight: 16,
                    borderRadius: "2pxs",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {uploadedFiles.length}
                </Button>
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  {uploadedFiles.map((f, i) => (
                    <MenuItem
                      key={`${f.name}-${i}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 4,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 100,
                          fontSize: tokens.fontSizeBase100,
                        }}
                      >
                        {f.name} · {Math.round((f.size / 1024) * 1024)} MB
                      </div>
                      <Button
                        appearance="subtle"
                        size="small"
                        title="Remove file"
                        aria-label="Remove file"
                        icon={<Dismiss12Regular width={12} height={12} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFiles((prev) => prev.filter((_, index) => index !== i));
                        }}
                        style={{
                          position:"absolute",
                          right:"4px",
                          bottom:"10px",
                          minWidth: 0,
                          padding: 0,
                          width: 10,
                          height: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      />
                    </MenuItem>
                  ))}
                </MenuList>
              </MenuPopover>
            </Menu>
          )}

          <Button
            className={styles.sendButton}
            style={{
              opacity: !input.trim() || isLoading ? 0.5 : 1,
              pointerEvents: !input.trim() || isLoading ? "none" : "auto",
            }}
            icon={<Send24Regular />}
            onClick={() => {
              if (!input.trim() || isLoading) {
                return;
              } else {
                handleSendMessage();
                setUploadedFiles([]);
              }
            }}
            appearance="primary"
          />
        </div>
      </div>
    </div>
  );
};
