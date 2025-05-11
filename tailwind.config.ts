import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  // Add the transitions.css file to the Tailwind processing
  // This allows our custom transition effects to be used
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'scroll': {
  				'0%': { transform: 'translateY(0)' },
  				'100%': { transform: 'translateY(-50%)' }
  			},
  			'typing': {
  				'0%': { width: '0%', borderColor: 'transparent' },
  				'5%': { width: '0%', borderColor: 'hsl(var(--destructive))' },
  				'30%': { width: '100%' },
  				'80%': { width: '100%' },
  				'85%': { width: '100%', borderColor: 'transparent' },
  				'90%': { width: '0%', borderColor: 'transparent' },
  				'100%': { width: '0%', borderColor: 'transparent' }
  			},
  			'blink': {
  				'0%': { borderColor: 'hsl(var(--destructive))' },
  				'50%': { borderColor: 'transparent' },
  				'100%': { borderColor: 'hsl(var(--destructive))' }
  			},
  			'fade-in': {
  				'0%': { opacity: '0', transform: 'translateY(5px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'scroll': 'scroll 20s linear infinite',
  			'typing': 'typing 4s steps(20) infinite',
  			'blink': 'blink 1s infinite',
  			'fade-in': 'fade-in 0.5s ease-out forwards'
  		}
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities }: { addUtilities: (utilities: Record<string, Record<string, string>>) => void }) {
      const newUtilities = {
        '.bg-scan-lines': {
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255, 0, 0, 0.1), rgba(255, 0, 0, 0.1) 1px, transparent 1px, transparent 2px)',
          pointerEvents: 'none',
        },
        '.glitch-text': {
          position: 'relative',
          animation: 'glitch 1s infinite',
        },
        '.digital-noise': {
          position: 'relative',
        },
        '.digital-noise::before': {
          content: '""',
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AkEBDEVgVO8PQAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAGMSURBVGje7dpBbsIwEAXQP5d3g3qEHgFxhB6hR+gRuuAIXHCuHKFdoEaKUBaThcGTOJkk/JdiaYLieZZnbCclgGtgB+yBSNNGYAcsgavUCTTAWxOkiXkDGmA1FcTCU4xXoAaWwANwbp6X5l0dU/sBrIHsGBCb/XMTtDMEYgNUxyxZl0XLInBK2X5/1WQXwDMQUt4QgGfgYgyIBXgZCaIWZA5ARYuRlnpKrZWZkbLKSsXMSEQ2M1JyRjQgmxkpOSMakM2MlJwRDchmRkrOiAZkMyMlZ0QDspmRkjOiAdnMSMkZ0YBsZqTkjGhANjNSckY0IJsZKTkjGpDNjJScEQ3IZkZKzogGZDMjJWdEA7KZkZIzogHZzEjJGdGAbGak5IxoQDYzUnJGNCCbGSk5IxqQzYyUnBENyGZGSs6IBmQzIyVnRAOymZGSM6IB2cxIyRnRgGxmpOSMaEA2M1JyRjQgmxkpOSMakM2MlJwRDchmRkrOiAZkMyMlZ0QDspmRkjPyC2QAyo0wkFGzAAAAAElFTkSuQmCC")',
          opacity: '0.05',
          pointerEvents: 'none',
        },
        '.crt-flicker': {
          animation: 'flicker 0.15s infinite',
        },
      };
      
      addUtilities(newUtilities);
    },
  ],
} satisfies Config;

export default config;
