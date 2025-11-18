import * as React from "react";
import { useState } from "react";
import {
  Button,
  Input,
  Label,
  Card,
  CardHeader,
  makeStyles,
  tokens,
  Text,
  Spinner,
} from "@fluentui/react-components";
import {
  Mail24Regular,
  LockClosed24Regular,
  Eye24Regular,
  EyeOff24Regular,
} from "@fluentui/react-icons";
import { useAuth } from "./AuthProvider";
import { brandColors } from "../../theme/brandColors";

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: tokens.spacingVerticalXL,
    background: brandColors.getGradient("whiteToGreen", "diagonal"),
  },
  card: {
    width: "100%",
    maxWidth: "500px",
    backgroundColor: brandColors.offWhite,
    boxShadow: `0 4px 20px rgba(35, 31, 32, 0.15)`,
  },
  cardHeader: {
    textAlign: "center",
    paddingBottom: tokens.spacingVerticalL,
  },
  logo: {
    height: "48px",
    marginBottom: tokens.spacingVerticalL,
  },
  welcomeText: {
    marginTop: tokens.spacingVerticalS,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
  },
  inputContainer: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
  inputWrapper: {
    position: "relative",
  },
  icon: {
    position: "absolute",
    left: tokens.spacingVerticalM,
    top: "50%",
    transform: "translateY(-50%)",
    color: brandColors.darkGreen,
    pointerEvents: "none",
  },
  input: {
    paddingLeft: "40px",
    "&::placeholder": {
      color: brandColors.gray,
    },
  },
  passwordToggle: {
    position: "absolute",
    right: tokens.spacingVerticalM,
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    background: "none",
    border: "none",
    color: brandColors.darkGreen,
    padding: 0,
    display: "flex",
    alignItems: "center",
    "&:hover": {
      color: brandColors.limeGreen,
    },
  },
  errorText: {
    color: "#d32f2f",
    fontSize: tokens.fontSizeBase200,
    marginTop: tokens.spacingVerticalXS,
  },
  button: {
    width: "100%",
    height: "44px",
    fontSize: tokens.fontSizeBase500,
    fontWeight: 600,
    backgroundColor: brandColors.darkGreen,
    color: brandColors.offWhite,
    "&:hover": {
      backgroundColor: brandColors.darkGreenSecondary,
    },
    "&:active": {
      backgroundColor: brandColors.darkGreen,
    },
  },
  label: {
    color: brandColors.black,
    fontWeight: 500,
  },
  welcomeHeading: {
    color: brandColors.black,
  },
  welcomeSubtext: {
    color: brandColors.gray,
  },
});

// Helper function to validate email format
const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) {
    return "Email is required";
  }
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  return null;
};

export function AuthPage() {
  const styles = useStyles();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { signIn } = useAuth();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setEmailError("");
    setPasswordError("");

    // Validate email format
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      setIsLoading(false);
      return;
    }

    const { error } = await signIn(email.trim(), password);

    if (error) {
      // Check if it's an email or password specific error
      if (
        error.message.toLowerCase().includes("email") ||
        error.message.toLowerCase().includes("user")
      ) {
        setEmailError(error.message);
      } else if (
        error.message.toLowerCase().includes("password") ||
        error.message.toLowerCase().includes("invalid")
      ) {
        setPasswordError(error.message);
      } else {
        setError(error.message);
      }
    }

    setIsLoading(false);
  };

  return (
    <div className={styles.root}>
      <div style={{ width: "100%", maxWidth: "500px" }}>
        <Card className={styles.card}>
          <div style={{ padding: tokens.spacingVerticalL }}>
            <div
              className={styles.cardHeader}
              style={{ display: "flex", justifyContent: "center" }}
            >
              <img src="assets/logo-filled.png" alt="MASIN Logo" className={styles.logo} />
            </div>
            <div className={styles.welcomeText}>
              <Text as="h2" size={600} weight="semibold" className={styles.welcomeHeading}>
                Welcome
              </Text>
              <Text as="p" size={400} className={styles.welcomeSubtext}>
                Sign in to your account
              </Text>
            </div>
            <form onSubmit={handleSignIn} className={styles.form}>
              {error && (
                <div
                  style={{
                    padding: tokens.spacingVerticalM,
                    backgroundColor: "#ffebee",
                    color: "#d32f2f",
                    borderRadius: tokens.borderRadiusMedium,
                    marginBottom: tokens.spacingVerticalM,
                    display: "flex",
                    alignItems: "center",
                    gap: tokens.spacingHorizontalS,
                    border: `1px solid #ffcdd2`,
                  }}
                >
                  <Text style={{ color: "#d32f2f" }}>{error}</Text>
                </div>
              )}

              <div className={styles.inputContainer}>
                <Label htmlFor="signin-email" required className={styles.label}>
                  Email <span style={{ color: "#d32f2f" }}>*</span>
                </Label>
                <div className={styles.inputWrapper}>
                  <Mail24Regular className={styles.icon} />
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    className={styles.input}
                    required
                    appearance={emailError ? "underline" : "outline"}
                  />
                </div>
                {emailError && <Text className={styles.errorText}>{emailError}</Text>}
              </div>

              <div className={styles.inputContainer}>
                <Label htmlFor="signin-password" required className={styles.label}>
                  Password <span style={{ color: "#d32f2f" }}>*</span>
                </Label>
                <div className={styles.inputWrapper}>
                  <LockClosed24Regular className={styles.icon} />
                  <Input
                    id="signin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    className={styles.input}
                    required
                    appearance={passwordError ? "underline" : "outline"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.passwordToggle}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff24Regular /> : <Eye24Regular />}
                  </button>
                </div>
                {passwordError && <Text className={styles.errorText}>{passwordError}</Text>}
              </div>

              <Button
                type="submit"
                className={styles.button}
                disabled={isLoading}
                style={{
                  backgroundColor: brandColors.darkGreen,
                  color: brandColors.offWhite,
                }}
              >
                {isLoading ? <Spinner /> : "Sign In"}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
