import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { makeStyles, tokens } from "@fluentui/react-components";
import { brandColors } from "../../theme/brandColors";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const useStyles = makeStyles({
  container: {
    width: '100%',
    wordBreak: 'break-word',
    '& p': {
      margin: `4px 0`,
      fontSize: tokens.fontSizeBase300,
      lineHeight: tokens.lineHeightBase300,
      color: brandColors.black,
    },
    '& h1': {
      fontSize: tokens.fontSizeBase500,
      fontWeight: tokens.fontWeightBold,
      margin: `${tokens.spacingVerticalM} 0 ${tokens.spacingVerticalS} 0`,
      paddingBottom: tokens.spacingVerticalXS,
      borderBottom: `1px solid ${brandColors.lightGray}`,
      color: brandColors.black,
    },
    '& h2': {
      fontSize: tokens.fontSizeBase500,
      fontWeight: tokens.fontWeightSemibold,
      margin: `${tokens.spacingVerticalM} 0 ${tokens.spacingVerticalS} 0`,
      paddingBottom: tokens.spacingVerticalXS,
      borderBottom: `1px solid ${brandColors.lightGray}`,
      color: brandColors.black,
    },
    '& h3': {
      fontSize: tokens.fontSizeBase500,
      fontWeight: tokens.fontWeightSemibold,
      margin: `${tokens.spacingVerticalM} 0 ${tokens.spacingVerticalS} 0`,
      color: brandColors.black,
    },
    '& h4, & h5, & h6': {
      fontSize: tokens.fontSizeBase500,
      fontWeight: tokens.fontWeightMedium,
      margin: `${tokens.spacingVerticalS} 0`,
      color: brandColors.black,
    },
    '& ul, & ol': {
      margin: `${tokens.spacingVerticalS} 0`,
      paddingLeft: tokens.spacingHorizontalL,
    },
    '& li': {
      margin: `2px 0`,
      fontSize: tokens.fontSizeBase300,
      lineHeight: tokens.lineHeightBase300,
      color: brandColors.black,
    },
    '& code': {
      backgroundColor: brandColors.offWhite,
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: tokens.fontSizeBase300,
      fontFamily: 'monospace',
      color: brandColors.darkGreen,
    },
    '& pre': {
      backgroundColor: brandColors.offWhite,
      padding: tokens.spacingVerticalM,
      borderRadius: '8px',
      overflow: 'auto',
      margin: `${tokens.spacingVerticalM} 0`,
      '& code': {
        backgroundColor: 'transparent',
        padding: 0,
      },
    },
    '& blockquote': {
      borderLeft: `4px solid ${brandColors.limeGreen}`,
      paddingLeft: tokens.spacingHorizontalM,
      margin: `${tokens.spacingVerticalM} 0`,
      fontStyle: 'italic',
      color: brandColors.gray,
    },
    '& a': {
      color: brandColors.darkGreen,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
        color: brandColors.limeGreen,
      },
    },
    '& strong': {
      fontWeight: tokens.fontWeightBold,
      color: brandColors.black,
    },
    '& em': {
      fontStyle: 'italic',
    },
    '& table': {
      width: '100%',
      borderCollapse: 'collapse',
      margin: `${tokens.spacingVerticalM} 0`,
    },
    '& th, & td': {
      border: `1px solid ${brandColors.lightGray}`,
      padding: tokens.spacingVerticalS,
      textAlign: 'left',
    },
    '& th': {
      backgroundColor: brandColors.offWhite,
      fontWeight: tokens.fontWeightSemibold,
    },
  },
});

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const styles = useStyles();

  const cleanContent = (text: string): string => {
    if (!text) return text;

    // Remove empty bullet points and markers
    return text
      .split('\n')
      .map(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.match(/^::\w+\s*$/)) {
          return '';
        }
        return line;
      })
      .filter(line => line !== '')
      .join('\n');
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeRaw, rehypeSanitize, rehypeKatex]}
      >
        {cleanContent(content)}
      </ReactMarkdown>
    </div>
  );
};

