import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary
        primary: '#1B6B6D',
        'primary-hover': '#15585A',
        'primary-light': '#E8F4F4',
        'primary-subtle': '#F0F8F8',
        // Secondary
        secondary: '#D4A843',
        'secondary-light': '#FDF6E7',
        'secondary-hover': '#C09338',
        // Neutral backgrounds
        bg: '#F8F6F3',
        'bg-card': '#FFFFFF',
        'bg-sidebar': '#F2F0ED',
        'bg-panel': '#FFFFFF',
        // Text
        'text-primary': '#1A1A2E',
        'text-secondary': '#5A5A6E',
        'text-tertiary': '#8E8E9A',
        'text-inverse': '#FFFFFF',
        // Semantic
        success: '#2D8A5E',
        'success-light': '#E8F5EE',
        warning: '#D4A843',
        'warning-light': '#FDF6E7',
        error: '#C75B4A',
        'error-light': '#FDF0EE',
        blocked: '#8E8E9A',
        'blocked-light': '#F2F2F4',
        premium: '#1B6B6D',
        'premium-gold': '#D4A843',
        // Borders
        border: '#E5E3E0',
        'border-focus': '#1B6B6D',
        'border-hover': '#D0CEC8',
      },
      fontFamily: {
        // font-display → DM Serif Display (headings, hero, greeting, page titles)
        display: ['DM Serif Display', 'serif'],
        // font-body → DM Sans (body text, buttons, labels, navigation)
        body: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        // font-sans → DM Sans (Tailwind default override)
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        display: ['2.25rem', { lineHeight: '1.2', fontWeight: '400' }],
        h1: ['1.5rem', { lineHeight: '1.35', fontWeight: '400' }],
        h2: ['1.375rem', { lineHeight: '1.35', fontWeight: '400' }],
        h3: ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['0.9375rem', { lineHeight: '1.6', fontWeight: '400' }],
        secondary: ['0.8125rem', { lineHeight: '1.4', fontWeight: '400' }],
        caption: ['0.6875rem', { lineHeight: '1.3', fontWeight: '500' }],
      },
      lineHeight: {
        tight: '1.3',
        heading: '1.4',
        body: '1.6',
      },
      boxShadow: {
        card: '0 1px 3px rgba(26, 26, 46, 0.06), 0 1px 2px rgba(26, 26, 46, 0.04)',
        'card-hover': '0 4px 12px rgba(26, 26, 46, 0.08), 0 2px 4px rgba(26, 26, 46, 0.04)',
        panel: '-4px 0 24px rgba(26, 26, 46, 0.08)',
        'chat-panel': '0 12px 48px rgba(26, 26, 46, 0.15), 0 4px 16px rgba(26, 26, 46, 0.08)',
        modal: '0 16px 48px rgba(26, 26, 46, 0.15)',
        dropdown: '0 8px 24px rgba(26, 26, 46, 0.12)',
      },
      borderRadius: {
        card: '12px',
        button: '10px',
        input: '10px',
        badge: '100px',
        'chat-panel': '16px',
      },
      width: {
        sidebar: '256px',
        'sidebar-collapsed': '64px',
        'detail-panel': '480px',
        'detail-panel-min': '400px',
        'chat-panel': '420px',
      },
      height: {
        'chat-panel': '600px',
      },
      maxWidth: {
        content: '960px',
      },
    },
  },
  plugins: [],
};

export default config;
