const tintColorLight = "#1B5E20";

export default {
  light: {
    text: "#0D1B0A",
    background: "#F8FDF8", // Eco-friendly light green
    tint: tintColorLight,
    tabIconDefault: "#81C784",
    tabIconSelected: tintColorLight,
    primary: "#1B5E20", // Deep forest green - eco theme
    secondary: "#2E7D32", // Rich eco green
    accent: "#4CAF50", // Vibrant eco accent
    surface: "#FFFFFF",
    border: "#C8E6C9",
    textSecondary: "#4E7C59",
    
    // EcoGarden sustainable color palette
    ecoPrimary: "#1B5E20", // Deep forest green - main brand
    ecoSecondary: "#2E7D32", // Rich eco green
    ecoAccent: "#66BB6A", // Vibrant eco accent
    ecoGold: "#FFC107", // Sustainable gold accent
    ecoEarth: "#8D6E63", // Earth brown accent
    ecoBackground: "#F8FDF8", // Eco-friendly light green
    ecoCard: "#FFFFFF", // Pure white cards
    ecoText: "#0D1B0A", // Deep eco text
    ecoTextSecondary: "#4E7C59", // Muted eco green
    ecoBorder: "#C8E6C9", // Subtle eco border
    ecoGradientStart: "#1B5E20", // Deep forest
    ecoGradientEnd: "#2E7D32", // Rich eco
    ecoLight: "#E8F5E8", // Very light eco
    ecoDark: "#0A1F0A", // Very dark forest
    ecoMint: "#A5D6A7", // Soft eco mint
    ecoIvory: "#F1F8E9", // Eco ivory
    
    // Environmental status colors
    success: "#4CAF50", // Eco success green
    warning: "#FF9800", // Eco warning orange
    error: "#F44336", // Clean error red
    info: "#2196F3", // Eco info blue
    
    // Carbon footprint colors
    carbonLow: "#4CAF50", // Low carbon - green
    carbonMedium: "#FF9800", // Medium carbon - orange
    carbonHigh: "#F44336", // High carbon - red
    
    // Weather colors
    sunny: "#FFC107", // Sunny weather
    cloudy: "#9E9E9E", // Cloudy weather
    rainy: "#2196F3", // Rainy weather
    
    // Enhanced eco palette
    ecoPlatinum: "#E0F2E0", // Eco platinum
    ecoCharcoal: "#2E2E2E", // Eco charcoal
    ecoEmerald: "#2E7D32", // Rich emerald
    ecoForest: "#1B5E20", // Deep forest
    ecoSage: "#689F38", // Eco sage
    ecoPearl: "#F1F8E9", // Eco pearl
    ecoOnyx: "#0A1F0A", // Eco onyx
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