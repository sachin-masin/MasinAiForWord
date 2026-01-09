import * as React from "react";
import { AuthPage } from "./Auth/AuthPage";
import { useAuth } from "./Auth/AuthProvider";
import { makeStyles, Spinner } from "@fluentui/react-components";
import { Layout } from "./Layout";
import { HomeView } from "./HomeView";
import { ChatView } from "./ChatView";
import {
  createConversation,
  getConversation,
  addMessage,
} from "./Chat/utils/supabaseChatService";
import { queryChatAPI, uploadFiles } from "./Chat/utils/chatApi";
import { Citation, StreamingResponse } from "./Chat/utils/streamingResponseHandlers";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../integrations/supabase/client";

interface AppProps {
  title: string;
}

type View = "LOADING" | "LOGIN" | "HOME" | "CHAT" | "CREATING_CONVERSATION";

const useStyles = makeStyles({
  root: { minHeight: "100vh" },
  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    padding: "20px",
    textAlign: "center"
  }
});

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

const App: React.FC<AppProps> = () => {
  const styles = useStyles();
  const { user, loading: authLoading } = useAuth();
  const [view, setView] = useState<View>("LOADING");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [docId, setDocId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [recentQueries, setRecentQueries] = useState<Array<{ id: string, title: string }>>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentChatTitle, setCurrentChatTitle] = useState("New Conversation");
  const [mode, setMode] = useState<"draft" | "edit">("draft");
  const [stagedFiles, setStagedFiles] = useState<Array<{ name: string; id: string }>>([]);
  const [recentLoading, setRecentLoading] = useState<boolean>(false);

  // Office API helpers
  const getDocumentIdentifier = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      try {
        if (typeof Office !== "undefined" && Office.context?.document) {
          Office.context.document.getFilePropertiesAsync((result: any) => {
            if (result?.status === Office.AsyncResultStatus.Succeeded && result.value?.url) {
              resolve(result.value.url);
            } else {
              resolve(null);
            }
          });
        } else {
          resolve(null);
        }
      } catch {
        resolve(null);
      }
    });
  }, []);

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
        resolve("");
      }
    });
  }, []);

  const insertTextAtCursor = useCallback(async (text: string) => {
    try {
      if (typeof Office !== "undefined" && Office.context?.document) {
        return new Promise<void>((resolve) => {
          Office.context.document.setSelectedDataAsync(
            text,
            { coercionType: Office.CoercionType.Text },
            (result: any) => {
              if (result.status === Office.AsyncResultStatus.Succeeded) {
                resolve();
              } else {
                console.warn("setSelectedDataAsync failed", result.error);
                resolve();
              }
            }
          );
        });
      } else {
        // Fallback to clipboard + manual paste or alert
        console.warn("Office API not available for insertion");
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch (e) {
      console.warn("insertTextAtCursor error", e);
    }
  }, []);

  const getFullDocumentText = useCallback(async (): Promise<string> => {
    try {
      if (typeof (window as any).Word !== "undefined" && (window as any).Word.run) {
        return await (window as any).Word.run(async (context: any) => {
          const body = context.document.body;
          body.load("text");
          await context.sync();
          return body.text.slice(0, 15000) || "";
        });
      }
    } catch (e) {
      console.warn("Full doc text failed", e);
    }
    return "";
  }, []);

  // Fetch recent queries from Supabase
  const fetchRecentQueries = useCallback(async () => {
    if (!user) return;
    setRecentLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, title')
        .eq('user_id', user.id)
        .eq('source', 'word_plugin')
        .order('updated_at', { ascending: false })
        .limit(5);

      if (data) {
        setRecentQueries(data);
      }
    } catch (e) {
      console.error("Failed to fetch recent queries", e);
    } finally {
      setRecentLoading(false);
    }
  }, [user]);

  // Initialize session logic
  const initializeSession = useCallback(async (forceNew = false) => {
    if (!user) return;

    const freshDocId = await getDocumentIdentifier();
    setDocId(freshDocId);

    // In the new UI, we show Home view first if not forced into a specific chat
    if (!forceNew) {
      fetchRecentQueries();
      setView("HOME");
      return;
    }

    // If forceNew is true, we just clear current chat state and go to CHAT
    if (forceNew) {
      setSessionId(null);
      setCurrentChatTitle("New Conversation");
      setMessages([]);
      setStagedFiles([]);
      setView("CHAT");
      return;
    }

    fetchRecentQueries();
    setView("HOME");
  }, [getDocumentIdentifier, user, fetchRecentQueries]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setView("LOGIN");
      return;
    }
    if (view === "LOADING" || view === "LOGIN") {
      initializeSession();
    }
  }, [user, authLoading, view, initializeSession]);

  const loadConversation = useCallback(async (sid: string) => {
    try {
      const conv = await getConversation(sid);
      if (conv) {
        setSessionId(sid);
        setCurrentChatTitle(conv.title);
        const msgs = (conv.messages || []).map((m: any) => ({
          id: m.id || crypto.randomUUID(),
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content || '',
          timestamp: m.created_at ? new Date(m.created_at) : new Date(),
        } as Message));
        setMessages(msgs);
        setView("CHAT");
      }
    } catch (e) {
      console.error("Load conversation failed", e);
    }
  }, []);

  const handleSendMessage = useCallback(async (input: string) => {
    if (!input.trim() || isStreaming) return;

    let activeSessionId = sessionId;

    // If we're on Home or have no sessionId, create a session on first message
    if (view === "HOME" || !activeSessionId) {
      const freshDocId = await getDocumentIdentifier();
      const title = input.slice(0, 50);
      const conv = await createConversation({
        title: title,
        source: "word_plugin",
        documentSessionId: freshDocId || undefined,
        userId: user!.id
      });
      if (conv?.id) {
        activeSessionId = conv.id;
        setSessionId(activeSessionId);
        setCurrentChatTitle(conv.title);
        setMessages([]);
        setView("CHAT");
      } else {
        return;
      }
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);

    const streamingMessageId = crypto.randomUUID();
    const initialStreamingMessage: Message = {
      id: streamingMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true
    };
    setMessages((prev) => [...prev, initialStreamingMessage]);

    try {
      await addMessage({
        conversationId: activeSessionId,
        role: 'user',
        content: userMessage.content,
      });

      const [selectedText, fullDocText] = await Promise.all([
        getSelectionText(),
        getFullDocumentText(),
      ]);

      // Format previous_context as the last 2 messages
      const lastTwoMessages = messages.slice(-2).map(m => ({
        role: m.role,
        content: m.content
      }));
      const previousContext = JSON.stringify(lastTwoMessages);

      await queryChatAPI(
        {
          question: userMessage.content,
          documentContext: fullDocText,
          selectedContentContext: selectedText,
          modelName: "gpt-5.2",
          documentIds: stagedFiles.map(f => f.id),
          previousContext: previousContext
        },
        {
          onUpdate: (data: Partial<StreamingResponse>) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === streamingMessageId
                  ? { ...msg, content: data.answer || msg.content }
                  : msg
              )
            );
          },
          onComplete: async (data: StreamingResponse) => {
            setIsStreaming(false);
            setStagedFiles([]);

            // If in edit mode, insert to document
            if (mode === "edit" && data.answer) {
              await insertTextAtCursor(data.answer);
            }

            await addMessage({
              conversationId: activeSessionId!,
              role: 'assistant',
              content: data.answer || "",
            });
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === streamingMessageId
                  ? { ...msg, content: data.answer || msg.content, isStreaming: false }
                  : msg
              )
            );
          },
        }
      );
    } catch (error) {
      setIsStreaming(false);
      setMessages((prev) => [
        ...prev.filter(m => m.id !== streamingMessageId),
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date()
        }
      ]);
    }
  }, [view, sessionId, isStreaming, user, getDocumentIdentifier, getSelectionText, getFullDocumentText, stagedFiles, mode, messages, insertTextAtCursor]);

  const handleUpload = async (files: FileList) => {
    try {
      const data = await uploadFiles(files);
      if (data.doc_ids) {
        const fileArray = Array.from(files);
        const newStaged = data.doc_ids.map((id, index) => ({
          name: fileArray[index]?.name || "Unknown file",
          id: id
        }));
        setStagedFiles(prev => [...prev, ...newStaged]);
      }
      return data;
    } catch (e) {
      console.error("Upload failed", e);
      throw e;
    }
  };

  const handleRemoveStagedFile = (index: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleModeToggle = () => {
    setMode(prev => prev === "draft" ? "edit" : "draft");
  };

  if (authLoading || (user && view === "LOADING")) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" label="Loading..." />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {view === "LOGIN" ? (
        <AuthPage />
      ) : (
        <Layout
          onNewConversation={() => initializeSession(true)}
          onSettingsClick={() => console.log('Settings clicked')}
          onHelpClick={() => window.open("https://masin.ai/help-masinai/", "_blank")}
        >
          {view === "CREATING_CONVERSATION" && (
            <div className={styles.loadingContainer}>
              <Spinner size="large" label="Creating conversation..." />
            </div>
          )}
          {view === "HOME" && (
            <HomeView
              onSendMessage={handleSendMessage}
              onUploadClick={handleUpload}
              onModeToggle={handleModeToggle}
              recentQueries={recentQueries}
              recentLoading={recentLoading}
              onRecentQueryClick={loadConversation}
              mode={mode}
              stagedFiles={stagedFiles}
              onRemoveStagedFile={handleRemoveStagedFile}
            />
          )}
          {view === "CHAT" && (
            <ChatView
              title={currentChatTitle}
              messages={messages}
              onBack={() => {
                setView("HOME");
                fetchRecentQueries();
              }}
              onSendMessage={handleSendMessage}
              onUploadClick={handleUpload}
              onModeToggle={handleModeToggle}
              isStreaming={isStreaming}
              mode={mode}
              user={user}
              onApplySelection={insertTextAtCursor}
              onApplyAll={insertTextAtCursor}
              stagedFiles={stagedFiles}
              onRemoveStagedFile={handleRemoveStagedFile}
            />
          )}
        </Layout>
      )}
    </div>
  );
};

export default App;
