/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta institucional Raguife — verde industrial + oliva + tons de dado (DM Mono)
        ink: {
          950: '#0a130a',
          900: '#162416', // --text
          800: '#23331f',
          700: '#34452e',
          600: '#465640',
        },
        steel: {
          50: '#f0f4f0',  // --bg
          100: '#eef3ee', // --surface2
          200: '#cddacd', // --border
          300: '#b7c9b5',
          400: '#93a890',
          500: '#5a6b5a', // --muted
          600: '#48583f',
          700: '#3a4834',
          800: '#293423',
          900: '#1c261b',
        },
        brand: {
          50: '#eaf5ee',
          100: '#d3ead9',
          200: '#a8d5b4',
          300: '#79bd8d',
          400: '#43996a',
          500: '#0a6b3f',
          600: '#024f2b', // --gdk (verde primário Raguife)
          700: '#013d21', // topo do gradiente do header
          800: '#012e19',
          900: '#011f11',
        },
        olive: {
          50: '#f3f6e9',
          100: '#e4ecc8',
          200: '#c7d999',
          300: '#a8d060', // --l5 (destaque lima)
          400: '#8fb448',
          500: '#739630', // --glt (verde-oliva secundário)
          600: '#5c7826',
          700: '#465c1e',
        },
        postit: {
          yellow: '#fef3b0',
          blue: '#bfe1f6',
          green: '#c8ecc0',
          pink: '#f6cbdd',
          orange: '#fbd9ad',
          purple: '#ddd0f3',
        },
        status: {
          low: '#0d7d5f',    // --teal
          medium: '#d97706', // --amber
          high: '#c0392b',   // --red (usado também para "alta")
          critical: '#a8281a',
        },
        raguife: {
          red: '#c0392b',
          amber: '#d97706',
          teal: '#0d7d5f',
          indigo: '#6366f1',
          cyan: '#0891b2',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        mono: ["'DM Mono'", 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'raguife-header': 'linear-gradient(135deg, #013d21 0%, #024f2b 60%, #025e32 100%)',
      },
      boxShadow: {
        postit: '2px 4px 10px rgba(15, 23, 42, 0.18), 0 1px 0 rgba(255,255,255,0.4) inset',
        'postit-hover': '4px 10px 22px rgba(15, 23, 42, 0.28), 0 1px 0 rgba(255,255,255,0.4) inset',
        panel: '0 10px 40px rgba(2, 79, 43, 0.14)',
        card: '0 2px 10px rgba(2, 79, 43, 0.07)',
      },
      animation: {
        'pin-in': 'pinIn 0.55s cubic-bezier(.2,.9,.3,1.2)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        pinIn: {
          '0%': { transform: 'translateY(-40px) scale(0.6) rotate(0deg)', opacity: '0' },
          '60%': { transform: 'translateY(4px) scale(1.05) rotate(var(--rot))', opacity: '1' },
          '100%': { transform: 'translateY(0) scale(1) rotate(var(--rot))', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        }
      }
    },
  },
  plugins: [],
}
