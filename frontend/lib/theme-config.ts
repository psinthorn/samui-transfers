/**
 * Default Theme Configuration
 * This file defines the current design system and can be synced to the database
 */

export const defaultTheme = {
  name: "default",
  colors: {
    // Primary brand colors
    primary: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6", // Main primary
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
    },
    // Secondary (Purple)
    secondary: {
      50: "#faf5ff",
      100: "#f3e8ff",
      200: "#e9d5ff",
      300: "#d8b4fe",
      400: "#c084fc",
      500: "#a855f7", // Main secondary
      600: "#9333ea",
      700: "#7e22ce",
      800: "#6b21a8",
      900: "#581c87",
    },
    // Accent (Amber)
    accent: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24", // Main accent
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
    },
    // Status colors
    success: {
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e", // Main success
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#145231",
    },
    danger: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444", // Main danger
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
    },
    warning: {
      50: "#fefce8",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b", // Main warning
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
    },
    // Neutral (Slate)
    neutral: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b", // Main neutral
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
  },

  typography: {
    fontFamily: {
      display: "'Montserrat', sans-serif",
      body: "'Inter', sans-serif",
      mono: "'Fira Code', monospace",
    },
    fontSizes: {
      xs: "12px",
      sm: "14px",
      base: "16px",
      lg: "18px",
      xl: "20px",
      "2xl": "24px",
      "3xl": "32px",
      "4xl": "40px",
      "5xl": "48px",
      "6xl": "60px",
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeights: {
      tight: 1.2,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },

  spacing: {
    baseUnit: "4px",
    scales: {
      0: "0",
      1: "4px",
      2: "8px",
      3: "12px",
      4: "16px",
      5: "20px",
      6: "24px",
      8: "32px",
      10: "40px",
      12: "48px",
      16: "64px",
      20: "80px",
      24: "96px",
    },
  },

  borderRadius: {
    none: "0",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    "2xl": "20px",
    full: "9999px",
  },

  shadows: {
    none: "none",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },

  components: {
    button: {
      borderRadius: "8px",
      paddingY: "12px",
      paddingX: "16px",
      fontWeight: 600,
      fontSize: "16px",
      transitionDuration: "200ms",
      variants: {
        primary: {
          background: "#3b82f6",
          color: "#ffffff",
          hover: "#2563eb",
          active: "#1d4ed8",
        },
        secondary: {
          background: "#a855f7",
          color: "#ffffff",
          hover: "#9333ea",
          active: "#7e22ce",
        },
        outline: {
          background: "transparent",
          color: "#3b82f6",
          border: "1px solid #3b82f6",
          hover: "#eff6ff",
        },
      },
    },
    card: {
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      borderColor: "#e2e8f0",
      borderWidth: "1px",
    },
    input: {
      borderRadius: "8px",
      padding: "12px 16px",
      borderColor: "#cbd5e1",
      borderWidth: "1px",
      fontSize: "16px",
      focusRing: "#3b82f6",
      focusRingWidth: "2px",
    },
    badge: {
      borderRadius: "9999px",
      paddingY: "4px",
      paddingX: "12px",
      fontSize: "12px",
      fontWeight: 600,
    },
  },
}

export type ThemeConfig = typeof defaultTheme
