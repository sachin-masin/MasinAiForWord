import * as React from "react";
import { AuthPage } from "./Auth/AuthPage";
import { useAuth } from "./Auth/AuthProvider";
import { makeStyles, Spinner } from "@fluentui/react-components";
import { ChatInterface } from "./Chat/ChatInterface";

interface AppProps {
  title: string;
}

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
  },
  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

const App: React.FC<AppProps> = () => {
  const styles = useStyles();
  const { user, loading } = useAuth();
  console.log("App render, user:", user, loading);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" label="Loading..." />
      </div>
    );
  }

  // Show login page if user is not authenticated
  if (!user) {
    return <AuthPage />;
  }

  // Show chat interface when authenticated
  return (
    <div className={styles.root}>
      <ChatInterface />
    </div>
  );
};

export default App;
