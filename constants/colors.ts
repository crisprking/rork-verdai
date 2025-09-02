const tintColorLight = "#1B4332";

export default {
  light: {
    text: "#0F1419",
    background: "#FEFFFE", // Pure sophisticated white
    tint: tintColorLight,
    tabIconDefault: "#95A5A6",
    tabIconSelected: tintColorLight,
    primary: "#1B4332", // Deep emerald forest - luxury botanical
    secondary: "#2D5A27", // Rich forest green
    accent: "#52B788", // Vibrant sage accent
    surface: "#FFFFFF",
    border: "#E8F5E8",
    textSecondary: "#52796F",
    
    // Premium botanical color palette - Old Money Aesthetic
    luxuryPrimary: "#1B4332", // Deep emerald forest - main brand
    luxurySecondary: "#2D5A27", // Rich forest green
    luxuryAccent: "#74C69D", // Soft mint highlight
    luxuryGold: "#D4AF37", // Classic gold accent
    luxuryRose: "#F4A261", // Warm terracotta accent
    luxuryBackground: "#FEFFFE", // Pure sophisticated white
    luxuryCard: "#FFFFFF", // Pure white cards
    luxuryText: "#0F1419", // Deep charcoal text
    luxuryTextSecondary: "#52796F", // Muted sage
    luxuryBorder: "#E8F5E8", // Subtle mint border
    luxuryGradientStart: "#1B4332", // Deep emerald
    luxuryGradientEnd: "#2D5A27", // Rich forest
    luxuryLight: "#F1F8E9", // Very light botanical
    luxuryDark: "#081C15", // Very dark forest
    luxuryMint: "#B7E4C7", // Soft mint
    luxuryIvory: "#F8F9FA", // Elegant ivory
    
    // Premium status colors
    success: "#22C55E", // Modern success green
    warning: "#F59E0B", // Premium amber
    error: "#EF4444", // Clean error red
    info: "#3B82F6", // Professional blue
    
    // Enhanced luxury palette for premium feel
    luxuryPlatinum: "#E5E7EB", // Platinum accents
    luxuryCharcoal: "#374151", // Deep charcoal
    luxuryEmerald: "#059669", // Rich emerald
    luxuryForest: "#064E3B", // Deep forest
    luxurySage: "#6B7280", // Sophisticated sage
    luxuryPearl: "#F9FAFB", // Pearl white
    luxuryOnyx: "#111827", // Onyx black
  },
};

// Export individual color constants for better tree-shaking
export const LuxuryColors = {
  PRIMARY: "#1B4332",
  SECONDARY: "#2D5A27",
  GOLD: "#D4AF37",
  BACKGROUND: "#FEFFFE",
  CARD: "#FFFFFF",
  TEXT: "#0F1419",
  TEXT_SECONDARY: "#52796F",
  BORDER: "#E8F5E8",
  SUCCESS: "#22C55E",
  WARNING: "#F59E0B",
  ERROR: "#EF4444",
  INFO: "#3B82F6",
} as const;

// Theme configuration for consistent styling
export const ThemeConfig = {
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    xlarge: 24,
    round: 50,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  typography: {
    fontSizes: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 20,
      xxxl: 24,
      display: 32,
    },
    fontWeights: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
  },
} as const;