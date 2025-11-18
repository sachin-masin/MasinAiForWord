import * as React from "react";
import { makeStyles, tokens } from "@fluentui/react-components";
import { brandColors } from "../../theme/brandColors";

interface StreamingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingVerticalXS,
  },
  dotsContainer: {
    display: 'flex',
    gap: '4px',
  },
  dot: {
    borderRadius: '50%',
    backgroundColor: brandColors.darkGreen,
    animationName: {
      '0%, 100%': {
        transform: 'translateY(0)',
        opacity: 0.7,
      },
      '50%': {
        transform: 'translateY(-8px)',
        opacity: 1,
      },
    },
    animationDuration: '1.4s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
  },
  dotSm: {
    width: '6px',
    height: '6px',
  },
  dotMd: {
    width: '8px',
    height: '8px',
  },
  dotLg: {
    width: '10px',
    height: '10px',
  },
  dotDelay1: {
    animationDelay: '0.1s',
  },
  dotDelay2: {
    animationDelay: '0.2s',
  },
});

export function StreamingIndicator({ size = 'sm', className = '' }: StreamingIndicatorProps) {
  const styles = useStyles();
  
  const dotSizeClass = size === 'sm' ? styles.dotSm : size === 'md' ? styles.dotMd : styles.dotLg;

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.dotsContainer}>
        <div className={`${styles.dot} ${dotSizeClass}`}></div>
        <div className={`${styles.dot} ${dotSizeClass} ${styles.dotDelay1}`}></div>
        <div className={`${styles.dot} ${dotSizeClass} ${styles.dotDelay2}`}></div>
      </div>
    </div>
  );
}

