import { globSync } from 'fast-glob';
import fs from 'node:fs/promises';
import { basename } from 'node:path';
import { defineConfig, presetIcons, presetUno, transformerDirectives } from 'unocss';

const iconPaths = globSync('./icons/*.svg');

const collectionName = 'bolt';

const customIconCollection = iconPaths.reduce(
  (acc, iconPath) => {
    const [iconName] = basename(iconPath).split('.');

    acc[collectionName] ??= {};
    acc[collectionName][iconName] = async () => fs.readFile(iconPath, 'utf8');

    return acc;
  },
  {} as Record<string, Record<string, () => Promise<string>>>,
);

const BASE_COLORS = {
  white: '#FFFFFF',
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
  },
  // W3Jverse Color Palette
  w3j: {
    // Primary: Bright Orange
    primary: {
      50: '#FFF4ED',
      100: '#FFEDDB',
      200: '#FFD6B3',
      300: '#FFBA80',
      400: '#FF964A',
      500: '#FF6B35', // Main Primary
      600: '#F54D1F',
      700: '#E6370F',
      800: '#C62E0A',
      900: '#A1280B',
      950: '#571105',
    },
    // Secondary: Gem Blue  
    secondary: {
      50: '#EBF8FF',
      100: '#D1F0FF',
      200: '#AEE6FF',
      300: '#7AD9FF',
      400: '#3FC4FF',
      500: '#1E90FF', // Main Secondary
      600: '#0074E6',
      700: '#005CB8',
      800: '#004B96',
      900: '#003F7A',
      950: '#002851',
    },
    // Accent: Gold Diamond
    accent: {
      50: '#FFFCEB',
      100: '#FFF8C7',
      200: '#FFF089',
      300: '#FFE24B',
      400: '#FFD700', // Main Accent
      500: '#F9C707',
      600: '#E09B02',
      700: '#B66F05',
      800: '#95560C',
      900: '#7A470D',
      950: '#46260E',
    },
    // Base: Dark Elegant
    base: {
      50: '#F3F3F6',
      100: '#E6E6ED',
      200: '#CECFD9',
      300: '#AAACBB',
      400: '#808397',
      500: '#646679',
      600: '#525463',
      700: '#444651',
      800: '#3B3C45',
      900: '#1A1A2E', // Main Base
      950: '#16172A',
    },
    // Royal: Deep Purple
    royal: {
      50: '#F5F1FF',
      100: '#EDE6FF',
      200: '#DDD0FF',
      300: '#C4ABFF',
      400: '#A479FF',
      500: '#8748FF',
      600: '#7B24F7',
      700: '#6A0DAD', // Main Royal
      800: '#590B8F',
      900: '#4B0975',
      950: '#2E044F',
    },
  },
  // Keep existing accent for compatibility during transition
  accent: {
    50: '#FFF4ED',
    100: '#FFEDDB',
    200: '#FFD6B3',
    300: '#FFBA80',
    400: '#FF964A',
    500: '#FF6B35', // W3Jverse Primary
    600: '#F54D1F',
    700: '#E6370F',
    800: '#C62E0A',
    900: '#A1280B',
    950: '#571105',
  },
  green: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
    950: '#052E16',
  },
  orange: {
    50: '#FFFAEB',
    100: '#FEEFC7',
    200: '#FEDF89',
    300: '#FEC84B',
    400: '#FDB022',
    500: '#F79009',
    600: '#DC6803',
    700: '#B54708',
    800: '#93370D',
    900: '#792E0D',
  },
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    950: '#450A0A',
  },
};

const COLOR_PRIMITIVES = {
  ...BASE_COLORS,
  alpha: {
    white: generateAlphaPalette(BASE_COLORS.white),
    gray: generateAlphaPalette(BASE_COLORS.gray[900]),
    red: generateAlphaPalette(BASE_COLORS.red[500]),
    accent: generateAlphaPalette(BASE_COLORS.accent[500]),
  },
};

export default defineConfig({
  safelist: [...Object.keys(customIconCollection[collectionName] || {}).map((x) => `i-bolt:${x}`)],
  shortcuts: {
    'bolt-ease-cubic-bezier': 'ease-[cubic-bezier(0.4,0,0.2,1)]',
    'transition-theme': 'transition-[background-color,border-color,color] duration-150 bolt-ease-cubic-bezier',
    kdb: 'bg-bolt-elements-code-background text-bolt-elements-code-text py-1 px-1.5 rounded-md',
    'max-w-chat': 'max-w-[var(--chat-max-width)]',
    
    // W3Jverse Glass Morphism Shortcuts
    'glass-light': 'backdrop-blur-sm bg-white/5 border border-white/20',
    'glass-medium': 'backdrop-blur-md bg-white/10 border border-white/20',
    'glass-heavy': 'backdrop-blur-xl bg-white/15 border border-white/30',
    'glass-dark': 'backdrop-blur-md bg-black/20 border border-white/10',
    
    // W3Jverse Shadows and Effects
    'shadow-glow': 'shadow-2xl shadow-orange-500/25',
    'shadow-glow-blue': 'shadow-2xl shadow-blue-500/25',
    'shadow-glow-gold': 'shadow-2xl shadow-yellow-500/25',
    'shadow-glow-purple': 'shadow-2xl shadow-purple-500/25',
    
    // W3Jverse Gradient Backgrounds
    'gradient-w3j': 'bg-gradient-to-br from-w3j-primary-500 via-w3j-secondary-500 to-w3j-royal-500',
    'gradient-w3j-subtle': 'bg-gradient-to-br from-w3j-primary-500/10 via-w3j-secondary-500/10 to-w3j-royal-500/10',
    
    // Animation shortcuts
    'animate-shimmer': 'animate-[shimmer_2s_infinite]',
    'animate-float': 'animate-[float_3s_ease-in-out_infinite]',
    'animate-glow': 'animate-[glow_2s_ease-in-out_infinite_alternate]',
  },
  rules: [
    /**
     * This shorthand doesn't exist in Tailwind and we overwrite it to avoid
     * any conflicts with minified CSS classes.
     */
    ['b', {}],
  ],
  theme: {
    animation: {
      shimmer: 'shimmer 2s infinite',
      float: 'float 3s ease-in-out infinite',
      glow: 'glow 2s ease-in-out infinite alternate',
      'fade-in': 'fadeIn 0.5s ease-out',
      'scale-in': 'scaleIn 0.3s ease-out',
      'slide-up': 'slideUp 0.4s ease-out',
    },
    keyframes: {
      shimmer: {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(100%)' },
      },
      float: {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-10px)' },
      },
      glow: {
        '0%': { boxShadow: '0 0 5px rgba(255, 107, 53, 0.5)' },
        '100%': { boxShadow: '0 0 20px rgba(255, 107, 53, 0.8), 0 0 30px rgba(255, 107, 53, 0.6)' },
      },
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      scaleIn: {
        '0%': { transform: 'scale(0.9)', opacity: '0' },
        '100%': { transform: 'scale(1)', opacity: '1' },
      },
      slideUp: {
        '0%': { transform: 'translateY(20px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
    },
    colors: {
      ...COLOR_PRIMITIVES,
      bolt: {
        elements: {
          borderColor: 'var(--bolt-elements-borderColor)',
          borderColorActive: 'var(--bolt-elements-borderColorActive)',
          background: {
            depth: {
              1: 'var(--bolt-elements-bg-depth-1)',
              2: 'var(--bolt-elements-bg-depth-2)',
              3: 'var(--bolt-elements-bg-depth-3)',
              4: 'var(--bolt-elements-bg-depth-4)',
            },
          },
          textPrimary: 'var(--bolt-elements-textPrimary)',
          textSecondary: 'var(--bolt-elements-textSecondary)',
          textTertiary: 'var(--bolt-elements-textTertiary)',
          code: {
            background: 'var(--bolt-elements-code-background)',
            text: 'var(--bolt-elements-code-text)',
          },
          button: {
            primary: {
              background: 'var(--bolt-elements-button-primary-background)',
              backgroundHover: 'var(--bolt-elements-button-primary-backgroundHover)',
              text: 'var(--bolt-elements-button-primary-text)',
            },
            secondary: {
              background: 'var(--bolt-elements-button-secondary-background)',
              backgroundHover: 'var(--bolt-elements-button-secondary-backgroundHover)',
              text: 'var(--bolt-elements-button-secondary-text)',
            },
            danger: {
              background: 'var(--bolt-elements-button-danger-background)',
              backgroundHover: 'var(--bolt-elements-button-danger-backgroundHover)',
              text: 'var(--bolt-elements-button-danger-text)',
            },
          },
          item: {
            contentDefault: 'var(--bolt-elements-item-contentDefault)',
            contentActive: 'var(--bolt-elements-item-contentActive)',
            contentAccent: 'var(--bolt-elements-item-contentAccent)',
            contentDanger: 'var(--bolt-elements-item-contentDanger)',
            backgroundDefault: 'var(--bolt-elements-item-backgroundDefault)',
            backgroundActive: 'var(--bolt-elements-item-backgroundActive)',
            backgroundAccent: 'var(--bolt-elements-item-backgroundAccent)',
            backgroundDanger: 'var(--bolt-elements-item-backgroundDanger)',
          },
          actions: {
            background: 'var(--bolt-elements-actions-background)',
            code: {
              background: 'var(--bolt-elements-actions-code-background)',
            },
          },
          artifacts: {
            background: 'var(--bolt-elements-artifacts-background)',
            backgroundHover: 'var(--bolt-elements-artifacts-backgroundHover)',
            borderColor: 'var(--bolt-elements-artifacts-borderColor)',
            inlineCode: {
              background: 'var(--bolt-elements-artifacts-inlineCode-background)',
              text: 'var(--bolt-elements-artifacts-inlineCode-text)',
            },
          },
          messages: {
            background: 'var(--bolt-elements-messages-background)',
            linkColor: 'var(--bolt-elements-messages-linkColor)',
            code: {
              background: 'var(--bolt-elements-messages-code-background)',
            },
            inlineCode: {
              background: 'var(--bolt-elements-messages-inlineCode-background)',
              text: 'var(--bolt-elements-messages-inlineCode-text)',
            },
          },
          icon: {
            success: 'var(--bolt-elements-icon-success)',
            error: 'var(--bolt-elements-icon-error)',
            primary: 'var(--bolt-elements-icon-primary)',
            secondary: 'var(--bolt-elements-icon-secondary)',
            tertiary: 'var(--bolt-elements-icon-tertiary)',
          },
          preview: {
            addressBar: {
              background: 'var(--bolt-elements-preview-addressBar-background)',
              backgroundHover: 'var(--bolt-elements-preview-addressBar-backgroundHover)',
              backgroundActive: 'var(--bolt-elements-preview-addressBar-backgroundActive)',
              text: 'var(--bolt-elements-preview-addressBar-text)',
              textActive: 'var(--bolt-elements-preview-addressBar-textActive)',
            },
          },
          terminals: {
            background: 'var(--bolt-elements-terminals-background)',
            buttonBackground: 'var(--bolt-elements-terminals-buttonBackground)',
          },
          dividerColor: 'var(--bolt-elements-dividerColor)',
          loader: {
            background: 'var(--bolt-elements-loader-background)',
            progress: 'var(--bolt-elements-loader-progress)',
          },
          prompt: {
            background: 'var(--bolt-elements-prompt-background)',
          },
          sidebar: {
            dropdownShadow: 'var(--bolt-elements-sidebar-dropdownShadow)',
            buttonBackgroundDefault: 'var(--bolt-elements-sidebar-buttonBackgroundDefault)',
            buttonBackgroundHover: 'var(--bolt-elements-sidebar-buttonBackgroundHover)',
            buttonText: 'var(--bolt-elements-sidebar-buttonText)',
          },
          cta: {
            background: 'var(--bolt-elements-cta-background)',
            text: 'var(--bolt-elements-cta-text)',
          },
        },
      },
    },
  },
  transformers: [transformerDirectives()],
  presets: [
    presetUno({
      dark: {
        light: '[data-theme="light"]',
        dark: '[data-theme="dark"]',
      },
    }),
    presetIcons({
      warn: true,
      collections: {
        ...customIconCollection,
      },
      unit: 'em',
    }),
  ],
});

/**
 * Generates an alpha palette for a given hex color.
 *
 * @param hex - The hex color code (without alpha) to generate the palette from.
 * @returns An object where keys are opacity percentages and values are hex colors with alpha.
 *
 * Example:
 *
 * ```
 * {
 *   '1': '#FFFFFF03',
 *   '2': '#FFFFFF05',
 *   '3': '#FFFFFF08',
 * }
 * ```
 */
function generateAlphaPalette(hex: string) {
  return [1, 2, 3, 4, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].reduce(
    (acc, opacity) => {
      const alpha = Math.round((opacity / 100) * 255)
        .toString(16)
        .padStart(2, '0');

      acc[opacity] = `${hex}${alpha}`;

      return acc;
    },
    {} as Record<number, string>,
  );
}
