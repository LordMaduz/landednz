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
        'primary-dark': '#145254',
        'primary-darker': '#0F3E40',
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
        warning: '#14B8A6',
        'warning-light': '#F0FAF9',
        error: '#C75B4A',
        'error-light': '#FDF0EE',
        'error-hover': '#B54E3E',
        blocked: '#8E8E9A',
        'blocked-light': '#F2F2F4',
        premium: '#1B6B6D',
        'premium-gold': '#D4A843',
        // Borders
        border: '#E5E3E0',
        'border-focus': '#1B6B6D',
        'border-hover': '#D0CEC8',
        'border-error': '#C75B4A',
      },
      fontFamily: {
        // font-display → DM Serif Display (headings, hero, greeting, page titles)
        display: ['DM Serif Display', 'serif'],
        // font-body → DM Sans (body text, buttons, labels, navigation)
        body: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        // font-sans → DM Sans (Tailwind default override)
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      spacing: {
        '3.25': '0.8125rem', // 13px — defer button vertical padding
        '3.75': '0.9375rem', // 15px — upgrade button vertical padding
        '4.5': '1.125rem',   // 18px — anchor box horizontal padding
      },
      borderWidth: {
        '1.5': '1.5px',
        '3': '3px',
      },
      fontSize: {
        h1: ['1.75rem', { lineHeight: '1.3', fontWeight: '400' }],       // 28px - Page titles, hero
        h2: ['1.5rem', { lineHeight: '1.35', fontWeight: '400' }],       // 24px - Major sections
        h3: ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],      // 18px - Component titles
        body: ['1rem', { lineHeight: '1.6', fontWeight: '400' }],        // 16px - Primary content
        small: ['0.875rem', { lineHeight: '1.4', fontWeight: '400' }],   // 14px - Secondary content
        caption: ['0.75rem', { lineHeight: '1.3', fontWeight: '400' }]   // 12px - Tasks, badges, fine print
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
        fab: '0 4px 16px rgba(27, 107, 109, 0.3)',
        'fab-hover': '0 8px 28px rgba(27, 107, 109, 0.35)',
        toggle: '0 1px 3px rgba(0, 0, 0, 0.15)',
        'auth-card': '0 4px 24px rgba(26, 26, 46, 0.06)',
      },
      borderRadius: {
        card: '12px',
        button: '10px',
        input: '10px',
        badge: '100px',
        'chat-panel': '16px',
        'r-button': '10px',
      },
      inset: {
        '10p': '10%',
        '15p': '15%',
        '8p': '8%',
      },
      width: {
        sidebar: '256px',
        'sidebar-collapsed': '64px',
        'detail-panel': '480px',
        'detail-panel-min': '400px',
        'chat-panel': '420px',
        'circle-lg': '300px',
        'circle-sm': '200px',
      },
      height: {
        'chat-panel': '600px',
        'chat-panel-mobile': '85vh',
        'circle-lg': '300px',
        'circle-sm': '200px',
      },
      maxWidth: {
        content: '960px',
        landing: '1120px',
        onboarding: '640px',
        'onboarding-question': '560px',
        'onboarding-scope': '480px',
        'auth-card': '420px',
      },
      transitionDuration: {
        fill: '400ms',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(160deg, #1B6B6D 0%, #145254 40%, #0F3E40 100%)',
        'cta-gradient': 'linear-gradient(160deg, #1B6B6D 0%, #0F3E40 100%)',
        'premium-gradient': 'linear-gradient(180deg, rgba(212, 168, 67, 0.06) 0%, transparent 100%)',
        'subscription-gradient': 'linear-gradient(135deg, #1B6B6D 0%, #145254 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
