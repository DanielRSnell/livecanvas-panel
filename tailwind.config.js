/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ShadCN default colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // LiveCanvas Native Colors
        lc: {
          'bg': '#0a0a0a',           // --color-interface-bg (Neutral-950)
          'bg-dark': '#171717',      // --color-interface-bg-dark (Neutral-900)
          'accent': '#262626',       // --color-accents (Neutral-800)
          'primary': '#3ecf8e',      // --color1 (Supabase Green)
          'primary-dark': '#22c55e', // --color1-lighter-30
          'secondary': '#171717',    // --color2
          'grey': '#404040',         // --color-grey (Neutral-700)
          'grey-light': '#737373',   // --color-lightgrey (Neutral-500)
          'grey-2': '#525252',       // --color-grey-2 (Neutral-600)
          'green': '#22c55e',        // --color-green
          'yellow': '#eab308',       // --color-yellow
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}