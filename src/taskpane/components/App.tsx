import * as React from "react";
import { AuthPage } from "./Auth/AuthPage";
import { useAuth } from "./Auth/AuthProvider";
import { makeStyles, Spinner } from "@fluentui/react-components";
import { ChatInterface } from "./Chat/ChatInterface";
import { postMessageToSession } from "./Chat/utils/chatApi";
import { createConversation, getConversation, getLatestConversation } from "./Chat/utils/supabaseChatService";
import { useCallback, useEffect, useState } from "react";

interface AppProps {
  title: string;
}

type View = "LOADING" | "LOGIN" | "CHAT" | "CREATING_CONVERSATION";

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
  },
  creatingTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#231f20"
  },
  creatingText: {
    fontSize: "14px",
    color: "#666"
  }
});

const App: React.FC<AppProps> = () => {
  const styles = useStyles();
  const { user, loading: authLoading } = useAuth();
  const [view, setView] = useState<View>("LOADING");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [docId, setDocId] = useState<string | null>(null);

  const getDocumentIdentifier = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      try {
        if (typeof Office !== "undefined" && Office.context?.document) {
          Office.context.document.getFilePropertiesAsync((result: any) => {
            if (
              result?.status === Office.AsyncResultStatus.Succeeded &&
              result.value?.url
            ) {
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

  const syncToLocalStorage = useCallback((sid: string, messages: any[]) => {
    const STORAGE_KEY = 'masin_chat_history';
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let sessions = stored ? JSON.parse(stored) : [];

      const sessionIndex = sessions.findIndex((s: any) => s.id === sid);
      const sessionData = {
        id: sid,
        title: 'Word Conversation',
        messages: messages.map(m => ({
          id: m.id || crypto.randomUUID(),
          content: m.content || '',
          role: m.role === 'assistant' ? 'assistant' : m.role,
          timestamp: m.created_at || new Date().toISOString(),
          sources: m.sources || [],
          followUpQuestions: m.follow_up_questions || []
        })),
        updatedAt: new Date().toISOString(),
        createdAt: sessions[sessionIndex]?.createdAt || new Date().toISOString(),
        source: 'word_plugin'
      };

      if (sessionIndex !== -1) {
        sessions[sessionIndex] = sessionData;
      } else {
        sessions.unshift(sessionData);
      }

      if (sessions.length > 50) sessions = sessions.slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to sync to masin_chat_history', e);
    }
  }, []);

  const initializeSession = useCallback(async (forceNew = false) => {
    if (!user) return;

    const freshDocId = await getDocumentIdentifier();
    setDocId(freshDocId);
    let sid: string | null = null;

    if (freshDocId && !forceNew) {
      sid = localStorage.getItem(`word_session_${freshDocId}`);
    }

    // If no doc-specific mapping, try to fetch the user's latest conversation
    if (!sid && !forceNew) {
      try {
        const latest = await getLatestConversation(user.id);
        if (latest) {
          sid = latest.id;
          if (freshDocId) {
            localStorage.setItem(`word_session_${freshDocId}`, sid);
          }
        }
      } catch (e) {
        console.warn('Failed to fetch latest conversation on initialization', e);
      }
    }

    if (!sid || forceNew) {
      setView("CREATING_CONVERSATION");
      try {
        const conv = await createConversation({
          title: `${user.id}-${new Date().toISOString()}`,
          source: "word_plugin",
          documentSessionId: freshDocId || undefined,
          userId: user.id
        });
        sid = conv?.id ?? null;

        if (sid) {
          if (freshDocId) {
            localStorage.setItem(`word_session_${freshDocId}`, sid);
          }

          setSessionId(sid);
          syncToLocalStorage(sid, []);
          setView("CHAT");
        } else {
          setView("CHAT");
        }
      } catch (error) {
        console.error("Failed to create conversation:", error);
        setView("CHAT");
      }
    } else {
      try {
        const fullConv = await getConversation(sid);
        syncToLocalStorage(sid, fullConv?.messages || []);
      } catch (e) {
        console.warn('Failed to sync existing session', e);
      }
      setSessionId(sid);
      setView("CHAT");
    }
  }, [getDocumentIdentifier, syncToLocalStorage, user]);

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

  const handleSessionChange = useCallback((newSessionId: string) => {
    setSessionId(newSessionId);

    // Persist mapping if we have a docId
    if (docId) {
      localStorage.setItem(`word_session_${docId}`, newSessionId);
    }

    getConversation(newSessionId).then(fullConv => {
      syncToLocalStorage(newSessionId, fullConv?.messages || []);
    }).catch(e => console.warn('Failed to sync changed session', e));
  }, [docId, syncToLocalStorage]);

  const handleNewConversation = useCallback(() => {
    initializeSession(true);
  }, [initializeSession]);

  if (authLoading || (user && view === "LOADING")) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" label="Loading..." />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {view === "LOGIN" && <AuthPage />}
      {view === "CREATING_CONVERSATION" && (
        <div className={styles.loadingContainer}>
          <Spinner size="large" />
          <div className={styles.creatingTitle}>Creating conversation...</div>
        </div>
      )}
      {view === "CHAT" && (
        <ChatInterface
          sessionId={sessionId}
          onSessionChange={handleSessionChange}
          onNewConversation={handleNewConversation}
        />
      )}
    </div>
  );
};

export default App;
