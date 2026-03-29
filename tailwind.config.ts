import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1a1a1a',
          soft: '#3a3a3a',
          faint: '#888888',
          trace: '#c8c4bc',
        },
        paper: {
          DEFAULT: '#fafaf6',
          2: '#f1ede2',
          3: '#e8e3d4',
        },
        emerald: {
          conn: '#3aaa88',
          soft: '#c5e7d8',
        },
        rose: {
          conn: '#dd4444',
          soft: '#f3c8c8',
        },
        amber: {
          conn: '#dca838',
          soft: '#f5e6b8',
        },
        slate: {
          conn: '#b8b3a4',
          soft: '#e3dfd2',
        },
        trigger: {
          branch: '#4a7aa8',
          'branch-soft': '#dde6f0',
          tag: '#8a5cb8',
          'tag-soft': '#e6dcef',
          pr: '#3a8a6e',
          'pr-soft': '#d5e8df',
          retry: '#c47a1c',
          'retry-soft': '#f0dcc0',
        },
      },
      fontFamily: {
        ui: ['var(--font-ui)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Courier New', 'monospace'],
      },
      letterSpacing: {
        'cmd-loose': '0.18em',
        'cmd-tight': '0.16em',
        wordmark: '0.22em',
      },
      fontSize: {
        '2xs': ['9px', '12px'],
        '3xs': ['10px', '13px'],
      },
    },
  },
  plugins: [],
};

export default config;
