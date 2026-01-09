import * as React from "react";
import { useState, useRef, useEffect } from "react";
import {
    makeStyles,
    Button,
    Textarea,
    tokens,
    Body1,
    Card,
    Menu,
    MenuTrigger,
    MenuPopover,
    MenuList,
    MenuItem,
    Spinner
} from "@fluentui/react-components";
import {
    Send24Regular,
    ArrowLeft24Regular,
    MoreHorizontal24Regular,
    ArrowUpload24Regular,
    Bot24Regular,
    Person24Regular,
    Copy24Regular,
    Check24Regular,
    Dismiss16Regular
} from "@fluentui/react-icons";
import { brandColors } from "../theme/brandColors";
import { MarkdownRenderer } from "./Chat/MarkdownRenderer";
import MasinAiAvatar from "./Chat/MasinAiAvatar";
import { User } from "@supabase/supabase-js";
import { StreamingIndicator } from "./Chat/StreamingIndicator";
import { Message } from "./App";

const useStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 16px",
        backgroundColor: "white",
        borderBottom: `1px solid ${brandColors.lightGray}`,
        height: "48px",
        flexShrink: 0,
    },
    headerTitle: {
        fontWeight: "600",
        color: brandColors.black,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: "60%",
    },
    avatarContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "32px",
        height: "32px",
        minWidth: "32px",
        minHeight: "32px",
    },
    messagesContainer: {
        flex: 1,
        overflowY: "auto",
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
    },
    messageRow: {
        display: "flex",
        width: "100%",
        gap: "12px",
        justifyContent: "flex-start",
    },
    userRow: {
    },
    assistantRow: {
    },
    userCard: {
        backgroundColor: brandColors.darkGreen,
        color: brandColors.offWhite,
        padding: tokens.spacingVerticalM,
        borderRadius: "6px 12px 12px 12px",
        maxWidth: "fit-content",
        border: "none",
        flex: 1,
        wordBreak: "break-word",
    },
    assistantCard: {
        backgroundColor: "white",
        padding: tokens.spacingVerticalM,
        borderRadius: "6px 12px 12px 12px",
        maxWidth: "100%",
        border: "none",
        position: "relative",
        flex: 1,
    },
    footer: {
        padding: "12px",
        backgroundColor: "transparent",
    },
    inputArea: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        backgroundColor: brandColors.offWhite,
        padding: "12px",
        borderRadius: "12px",
        border: `1px solid ${brandColors.lightGray}`,
        boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
    },
    textarea: {
        minHeight: "40px",
        maxHeight: "120px",
        border: "none",
        fontSize: "14px",
        "&:focus-within": {
            outline: "none",
        },
    },
    inputActions: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    actionButton: {
        minWidth: "32px",
        height: "32px",
        color: brandColors.darkGreen,
    },
    sendButton: {
        minWidth: "32px",
        height: "32px",
        backgroundColor: brandColors.darkGreen,
        color: "white",
        padding: "0 12px",
        borderRadius: "6px",
        "&:hover": {
            backgroundColor: brandColors.darkGreenSecondary,
        }
    },
    typingIndicator: {
        display: "flex",
        gap: "4px",
        padding: "12px 16px",
        "& span": {
            width: "6px",
            height: "6px",
            backgroundColor: brandColors.gray,
            borderRadius: "50%",
            display: "inline-block",
            animation: "typing 1.4s infinite ease-in-out both",
        },
        "& span:nth-child(1)": { animationDelay: "-0.32s" },
        "& span:nth-child(2)": { animationDelay: "-0.16s" },
    },
    "@keyframes typing": {
        "0%, 80%, 100%": { transform: "scale(0)" },
        "40%": { transform: "scale(1)" }
    },
    uploadedFilesInfo: {
        padding: "4px 8px",
        backgroundColor: brandColors.offWhite,
        borderRadius: "4px",
        fontSize: "12px",
        color: brandColors.gray,
        display: "flex",
        alignItems: "center",
        gap: "8px",
    }
});

interface ChatViewProps {
    title: string;
    messages: Message[];
    onBack: () => void;
    onSendMessage: (message: string) => void;
    onUploadClick: (files: FileList) => Promise<any>;
    onModeToggle: () => void;
    isStreaming?: boolean;
    mode: "draft" | "edit";
    user?: User;
    onApplySelection?: (text: string) => void;
    onApplyAll?: (text: string) => void;
    stagedFiles: Array<{ name: string; id: string }>;
    onRemoveStagedFile: (index: number) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
    title,
    messages,
    onBack,
    onSendMessage,
    onUploadClick,
    onModeToggle,
    isStreaming,
    mode,
    user,
    onApplySelection,
    onApplyAll,
    stagedFiles,
    onRemoveStagedFile
}) => {
    const styles = useStyles();
    const [input, setInput] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFileNames, setUploadedFileNames] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);
    const [selectionMessageId, setSelectionMessageId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isStreaming]);

    useEffect(() => {
        const handleSelectionChange = () => {
            const selection = window.getSelection();
            if (selection && selection.toString().trim()) {
                // Check which message card contains the selection
                for (const [id, el] of Object.entries(messageRefs.current)) {
                    if (el && selection.anchorNode && el.contains(selection.anchorNode)) {
                        setSelectionMessageId(id);
                        return;
                    }
                }
            }
            setSelectionMessageId(null);
        };

        document.addEventListener('selectionchange', handleSelectionChange);
        return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, []);

    const handleSend = () => {
        if (input.trim() && !isStreaming) {
            onSendMessage(input);
            setInput("");
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsUploading(true);
            const names = Array.from(e.target.files).map(f => f.name);
            setUploadedFileNames(names);
            try {
                await onUploadClick(e.target.files);
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleApplySelection = (messageId: string, fallbackText: string) => {
        const selection = window.getSelection();
        let text = "";
        if (selection && selection.toString().trim() && selectionMessageId === messageId) {
            text = selection.toString();
        } else {
            text = fallbackText;
        }
        if (text && onApplySelection) {
            onApplySelection(text);
        }
    };

    return (
        <div className={styles.root}>
            <header className={styles.header}>
                <Button
                    appearance="subtle"
                    icon={<ArrowLeft24Regular />}
                    onClick={onBack}
                />
                <Body1 className={styles.headerTitle}>{title}</Body1>
                <Menu>
                    <MenuTrigger disableButtonEnhancement>
                        <Button appearance="subtle" icon={<MoreHorizontal24Regular />} />
                    </MenuTrigger>
                    <MenuPopover>
                        <MenuList>
                            <MenuItem>Clear History</MenuItem>
                        </MenuList>
                    </MenuPopover>
                </Menu>
            </header>

            <div className={styles.messagesContainer}>
                {messages.length === 0 && !isStreaming && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '16px', color: brandColors.gray }}>
                        <MasinAiAvatar size={64} />
                        <Body1>I am MasinAI, how can I assist you today?</Body1>
                    </div>
                )}
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={styles.messageRow}
                    >
                        <div className={styles.avatarContainer}>
                            {msg.role === "assistant" ? (
                                <MasinAiAvatar size={32} />
                            ) : (
                                <div style={{ backgroundColor: brandColors.darkGreen, borderRadius: '50%', display: 'flex', color: brandColors.offWhite, width: '32px', height: '32px', justifyContent: 'center', alignItems: 'center', maxWidth: '32px', maxHeight: '32px' }}>
                                    {user?.user_metadata?.full_name ? (
                                        (() => {
                                            const nameParts =
                                                user.user_metadata.full_name
                                                    .trim()
                                                    .split(" ");
                                            if (nameParts.length >= 2) {
                                                return (
                                                    nameParts[0].charAt(0) +
                                                    nameParts[nameParts.length - 1].charAt(
                                                        0
                                                    )
                                                ).toUpperCase();
                                            }
                                            return nameParts[0].charAt(0).toUpperCase();
                                        })()
                                    ) : (
                                        "U"
                                    )}
                                </div>
                            )}
                        </div>
                        <Card
                            className={msg.role === "user" ? styles.userCard : styles.assistantCard}
                            ref={(el) => (messageRefs.current[msg.id] = el as HTMLDivElement)}
                        >
                            {msg.role === "assistant" && !msg.isStreaming && (
                                <Button
                                    icon={copied ? <Check24Regular /> : <Copy24Regular />}
                                    appearance="subtle"
                                    size="small"
                                    onClick={() => copyToClipboard(msg.content)}
                                    title="Copy message"
                                    style={{ position: "absolute", top: "8px", right: "8px" }}
                                />
                            )}
                            {msg.role === "user" ? (
                                <div style={{ margin: 0, fontSize: '14px' }}>{msg.content}</div>
                            ) : (
                                <>
                                    {msg.content ? (
                                        <div style={{ marginRight: msg.isStreaming ? 0 : '32px' }}>
                                            <MarkdownRenderer content={msg.content} />
                                        </div>
                                    ) : (
                                        <StreamingIndicator />
                                    )}

                                    {!msg.isStreaming && mode === "draft" && (
                                        <div style={{ marginTop: tokens.spacingVerticalS, display: "flex", gap: tokens.spacingHorizontalS }}>
                                            <Button
                                                size="small"
                                                appearance="primary"
                                                onClick={() => handleApplySelection(msg.id, msg.content)}
                                                disabled={selectionMessageId !== msg.id}
                                            >
                                                Apply selection
                                            </Button>
                                            <Button
                                                size="small"
                                                appearance="subtle"
                                                onClick={() => onApplyAll?.(msg.content)}
                                            >
                                                Apply all
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </Card>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <footer className={styles.footer}>
                <div style={{ marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {stagedFiles.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 4px' }}>
                            {isUploading && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Spinner size="small" />
                                    <span style={{ color: brandColors.gray, fontSize: 12 }}>Uploading...</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '0 4px' }}>
                                {stagedFiles.map((file, index) => (
                                    <div key={file.id} className={styles.uploadedFilesInfo} style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: brandColors.lightGray + '44' }}>
                                        <span style={{ fontSize: '11px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
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
                        </div>
                    )}
                </div>
                <div className={styles.inputArea}>
                    <Textarea
                        placeholder="Type your message..."
                        className={styles.textarea}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        resize="none"
                    />
                    <div className={styles.inputActions}>
                        <div style={{ display: "flex", gap: "8px" }}>
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
                        <Button
                            className={styles.sendButton}
                            onClick={handleSend}
                            disabled={!input.trim() || isStreaming}
                            icon={<Send24Regular />}
                        />
                    </div>
                </div>
            </footer>
        </div>
    );
};
