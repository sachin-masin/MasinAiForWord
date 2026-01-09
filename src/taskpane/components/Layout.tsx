import * as React from "react";
import { makeStyles, Button, Tooltip, tokens } from "@fluentui/react-components";
import { Add24Regular, Settings24Regular, QuestionCircle24Regular } from "@fluentui/react-icons";
import { brandColors } from "../theme/brandColors";

const useStyles = makeStyles({
    root: {
        display: "flex",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
    },
    sidebar: {
        width: "32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "12px 0",
        gap: "12px",
        backgroundColor: "white",
        borderRight: `1px solid ${brandColors.lightGray}`,
        flexShrink: 0,
    },
    sidebarBottom: {
        marginTop: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    mainContent: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        background: brandColors.getGradient("whiteToGreen", "diagonal"),
    },
    iconButton: {
        minWidth: "32px",
        height: "32px",
        padding: "0",
        color: brandColors.darkGreen,
        "&:hover": {
            backgroundColor: brandColors.offWhite,
            color: brandColors.darkGreenSecondary,
        },
    },
});

interface LayoutProps {
    children: React.ReactNode;
    onNewConversation: () => void;
    onSettingsClick?: () => void;
    onHelpClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
    children,
    onNewConversation,
    onSettingsClick,
    onHelpClick
}) => {
    const styles = useStyles();

    return (
        <div className={styles.root}>
            <aside className={styles.sidebar}>
                <Tooltip content="New Conversation" relationship="label">
                    <Button
                        appearance="subtle"
                        icon={<Add24Regular />}
                        className={styles.iconButton}
                        onClick={onNewConversation}
                    />
                </Tooltip>

                <div className={styles.sidebarBottom}>
                    <Tooltip content="Settings" relationship="label">
                        <Button
                            appearance="subtle"
                            icon={<Settings24Regular />}
                            className={styles.iconButton}
                            onClick={onSettingsClick}
                        />
                    </Tooltip>
                    <Tooltip content="Help" relationship="label">
                        <Button
                            appearance="subtle"
                            icon={<QuestionCircle24Regular />}
                            className={styles.iconButton}
                            onClick={onHelpClick}
                        />
                    </Tooltip>
                </div>
            </aside>
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
};
