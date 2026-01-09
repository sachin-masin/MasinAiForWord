import * as React from "react";
import { useState } from "react";
import {
    makeStyles,
    Button,
    Textarea,
    tokens,
    Body1,
    Caption1,
    Spinner
} from "@fluentui/react-components";
import {
    Send24Regular,
    ArrowUpload24Regular,
    Edit24Regular,
    Document24Regular,
    Bot24Regular,
    Person24Regular,
    Dismiss16Regular
} from "@fluentui/react-icons";
import { brandColors } from "../theme/brandColors";

const useStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "40px 20px",
        gap: "32px",
        width: "100%",
        boxSizing: "border-box",
    },
    logoContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
    },
    logo: {
        width: "120px",
        height: "auto",
    },
    inputArea: {
        width: "100%",
        maxWidth: "500px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        border: `1px solid ${brandColors.lightGray}`,
    },
    textarea: {
        minHeight: "80px",
        border: "none",
        fontSize: "16px",
        "&:focus-within": {
            outline: "none",
        },
    },
    inputActions: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: "12px",
        borderTop: `1px solid ${brandColors.offWhite}`,
    },
    leftActions: {
        display: "flex",
        gap: "8px",
    },
    uploadedFiles: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        padding: "0 4px",
    },
    actionButton: {
        minWidth: "36px",
        height: "36px",
        color: brandColors.darkGreen,
        "&:hover": {
            backgroundColor: brandColors.offWhite,
        }
    },
    sendButton: {
        backgroundColor: brandColors.darkGreen,
        color: "white",
        padding: "0 24px",
        height: "36px",
        borderRadius: "6px",
        "&:hover": {
            backgroundColor: brandColors.darkGreenSecondary,
        }
    },
    recentSection: {
        width: "100%",
        maxWidth: "500px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        marginTop: "20px",
    },
    recentTitle: {
        fontWeight: "bold",
        color: brandColors.black,
    },
    recentList: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        maxHeight: "220px",
        overflowY: "auto",
        minWidth: "220px",
    },
    recentItem: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px",
        backgroundColor: "rgba(255,255,255,0.5)",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "background-color 0.2s",
        "&:hover": {
            backgroundColor: "rgba(255,255,255,0.8)",
        }
    },
    recentIcon: {
        color: brandColors.darkGreen,
    },
    uploadedFilesInfo: {
        marginTop: "8px",
        padding: "4px 8px",
        backgroundColor: brandColors.offWhite,
        borderRadius: "4px",
        fontSize: "12px",
        color: brandColors.gray,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        maxWidth: "60px"
    }
});

interface HomeViewProps {
    onSendMessage: (message: string) => void;
    onUploadClick: (files: FileList) => Promise<any>;
    onModeToggle: () => void;
    recentQueries: Array<{ id: string, title: string }>;
    recentLoading?: boolean;
    onRecentQueryClick: (id: string) => void;
    mode: "draft" | "edit";
    stagedFiles: Array<{ id: string, name: string }>;
    onRemoveStagedFile: (index: number) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
    onSendMessage,
    onUploadClick,
    onModeToggle,
    recentQueries,
    recentLoading = false,
    onRecentQueryClick,
    mode,
    stagedFiles,
    onRemoveStagedFile
}) => {
    const styles = useStyles();
    const [input, setInput] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if (input.trim()) {
            onSendMessage(input);
            setInput("");
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsUploading(true);
            try {
                await onUploadClick(e.target.files);
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className={styles.root}>
            <div className={styles.logoContainer}>
                <img
                    src="../../../assets/logo-filled.png"
                    alt="MasinAI Logo"
                    className={styles.logo}
                />
            </div>

            <div className={styles.inputArea}>
                <Textarea
                    placeholder="Ask MasinAI anything..."
                    className={styles.textarea}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    resize="none"
                />
                <div className={styles.inputActions}>
                    <div className={styles.leftActions}>
                        <div className={styles.uploadedFiles}>
                            <div style={{ marginBottom: '8px', display: 'flex', gap: '4px' }}>
                                {stagedFiles.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '0 4px' }}>
                                        {stagedFiles.map((file, index) => (
                                            <div key={file.id} className={styles.uploadedFilesInfo} style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: brandColors.lightGray + '44' }}>
                                                <span style={{ fontSize: '11px', maxWidth: '50px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                                                <Button
                                                    size="small"
                                                    appearance="subtle"
                                                    icon={<Dismiss16Regular style={{ fontSize: '12px' }} />}
                                                    onClick={() => onRemoveStagedFile(index)}
                                                    style={{ minWidth: 'auto', width: '16px', height: '16px', padding: 0 }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className={styles.leftActions}>
                                <Button
                                    appearance="subtle"
                                    icon={isUploading ? <Spinner size="small" /> : <ArrowUpload24Regular />}
                                    className={styles.actionButton}
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    title="Upload File"
                                />
                                <Button
                                    appearance="subtle"
                                    icon={mode === "draft" ? <Person24Regular /> : <Bot24Regular />}
                                    className={styles.actionButton}
                                    onClick={onModeToggle}
                                    title={`${mode === "draft" ? "Manual" : "Auto Apply"}`}
                                />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                    multiple
                                />
                            </div>
                        </div>
                    </div>
                    <Button
                        className={styles.sendButton}
                        onClick={handleSend}
                        disabled={!input.trim()}
                    >
                        Send
                    </Button>
                </div>
            </div>
            {recentLoading ? (
                <div className={styles.recentSection}>
                    <Body1 className={styles.recentTitle}>Recent Queries</Body1>
                    <div className={styles.recentList}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Spinner size="small" label="Loading..." />
                        </div>
                    </div>
                </div>
            ) : recentQueries.length > 0 ? (
                <div className={styles.recentSection}>
                    <Body1 className={styles.recentTitle}>Recent Queries</Body1>
                    <div className={styles.recentList}>
                        {recentQueries.map((query) => (
                            <div
                                key={query.id}
                                className={styles.recentItem}
                                onClick={() => onRecentQueryClick(query.id)}
                            >
                                <Document24Regular className={styles.recentIcon} />
                                <Caption1>{query.title || "Untitled Conversation"}</Caption1>
                            </div>
                        ))}
                    </div>
                </div>
                ) : (
                <div className={styles.recentSection}>
                    <Body1 className={styles.recentTitle}>Recent Queries</Body1>
                    <div className={styles.recentList}>
                        <Caption1 style={{ color: brandColors.gray }}>No recent queries yet.</Caption1>
                    </div>
                </div>
            )}
        </div>
    );
};
