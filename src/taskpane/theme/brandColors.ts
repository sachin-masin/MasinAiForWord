/**
 * Brand Colors - Global Color Palette
 * 
 * 
 * // Usage in makeStyles
 * const useStyles = makeStyles({
 *   container: {
 *     backgroundColor: brandColors.offWhite,
 *     color: brandColors.black,
 *   },
 *   button: {
 *     backgroundColor: brandColors.darkGreen,
 *     '&:hover': {
 *       backgroundColor: brandColors.darkGreenSecondary,
 *     },
 *   },
 *   background: {
 *     background: brandColors.getGradient('whiteToGreen', 'diagonal'),
 *   },
 * });
 * 
 * // Usage in inline styles
 * <div style={{ backgroundColor: brandColors.limeGreen }}>
 *   Content
 * </div>
 */

export const brandColors = {
  // Primary Colors
  gray: "#808286",
  limeGreen: "#aad03e",
  darkGreen: "#317c3b",
  offWhite: "#f8f6f4",

  // Secondary Colors
  black: "#231f20",
  lightGray: "#c0bdb9",
  darkGreenSecondary: "#006838", 
  gradientGreen: "#006658", 

  // Gradients
  gradients: {
    // White to Dark Green gradient
    whiteToGreen: {
      start: "#ffffff",
      end: "#006658",
    },
    // Dark gradient (from very dark to dark green)
    darkGreen: {
      start: "#251212",
      end: "#006658",
    },
  },

  // Helper function to create gradient strings
  getGradient: (gradientType: "whiteToGreen" | "darkGreen", direction: "horizontal" | "vertical" | "diagonal" = "diagonal") => {
    const gradient = brandColors.gradients[gradientType];
    const angle = direction === "horizontal" ? "90deg" : direction === "vertical" ? "180deg" : "135deg";
    return `linear-gradient(${angle}, ${gradient.start} 0%, ${gradient.end} 100%)`;
  },
} as const;

export const {
  gray,
  limeGreen,
  darkGreen,
  offWhite,
  black,
  lightGray,
  darkGreenSecondary,
  gradientGreen,
} = brandColors;

export const getBrandGradient = brandColors.getGradient;

