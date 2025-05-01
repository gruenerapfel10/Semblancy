import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx,mdx}",
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}"
  ],
  theme: {
  	extend: {
  		colors: {
  			brand: 'var(--brand-color)',
  			text: 'var(--text-color)',
  			'text-75': 'var(--text-color-75)',
  			'text-50': 'var(--text-color-50)',
  			border: 'hsl(var(--border))',
  			'input-bg': 'var(--input-background)',
  			'card-bg': 'var(--card-background)',
  			'secondary-bg': 'var(--secondary-background)',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			'brand-primary': 'hsl(var(--brand-primary))',
  			'brand-primary-light': 'hsl(var(--brand-primary-light))',
  			'brand-primary-lighter': 'hsl(var(--brand-primary-lighter))',
  			'brand-primary-dark': 'hsl(var(--brand-primary-dark))',
  			'brand-primary-darker': 'hsl(var(--brand-primary-darker))',
  			'brand-complement': 'hsl(var(--brand-complement))',
  			'brand-complement-light': 'hsl(var(--brand-complement-light))',
  			'brand-complement-lighter': 'hsl(var(--brand-complement-lighter))',
  			'brand-complement-dark': 'hsl(var(--brand-complement-dark))',
  			'brand-complement-darker': 'hsl(var(--brand-complement-darker))',
  			'brand-analogous-1': 'hsl(var(--brand-analogous-1))',
  			'brand-analogous-2': 'hsl(var(--brand-analogous-2))',
  			'neutral-50': 'hsl(var(--neutral-50))',
  			'neutral-100': 'hsl(var(--neutral-100))',
  			'neutral-200': 'hsl(var(--neutral-200))',
  			'neutral-300': 'hsl(var(--neutral-300))',
  			'neutral-400': 'hsl(var(--neutral-400))',
  			'neutral-500': 'hsl(var(--neutral-500))',
  			'neutral-600': 'hsl(var(--neutral-600))',
  			'neutral-700': 'hsl(var(--neutral-700))',
  			'neutral-800': 'hsl(var(--neutral-800))',
  			'neutral-900': 'hsl(var(--neutral-900))',
  			'neutral-950': 'hsl(var(--neutral-950))',
  			success: 'hsl(var(--success))',
  			warning: 'hsl(var(--warning))',
  			error: 'hsl(var(--error))',
  			info: 'hsl(var(--info))',
  			'background-alt': 'hsl(var(--background-alt))',
  			'background-elevated': 'hsl(var(--background-elevated))',
  			'text-primary': 'hsl(var(--text-primary))',
  			'text-secondary': 'hsl(var(--text-secondary))',
  			'text-tertiary': 'hsl(var(--text-tertiary))',
  			'text-inverted': 'hsl(var(--text-inverted))',
  			'border-light': 'hsl(var(--border-light))',
  			'border-medium': 'hsl(var(--border-medium))',
  			'border-strong': 'hsl(var(--border-strong))',
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		animation: {
  			'fade-in': 'fadeIn var(--duration-normal) ease-out',
  			'slide-up': 'slideUp var(--duration-normal) ease-out',
  			'slide-down': 'slideDown var(--duration-normal) ease-out',
  			'scale-in': 'scaleIn var(--duration-normal) ease-out',
  			spin: 'spin 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite',
  			pulse: 'pulse 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite',
  			float: 'float 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			slideUp: {
  				'0%': {
  					transform: 'translateY(20px)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			slideDown: {
  				'0%': {
  					transform: 'translateY(-20px)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			spin: {
  				'0%': {
  					transform: 'rotate(0deg)'
  				},
  				'100%': {
  					transform: 'rotate(360deg)'
  				}
  			},
  			pulse: {
  				'0%, 100%': {
  					transform: 'scale(1)'
  				},
  				'50%': {
  					transform: 'scale(1.05)'
  				}
  			},
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0)'
  				},
  				'50%': {
  					transform: 'translateY(-10px)'
  				}
  			},
  			scaleIn: {
  				'0%': {
  					transform: 'scale(0.95)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'scale(1)',
  					opacity: '1'
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius-lg)',
  			md: 'var(--radius-md)',
  			sm: 'var(--radius-sm)',
  			xl: 'var(--radius-xl)',
  			full: 'var(--radius-full)'
  		}
  	}
  },
  plugins: [animate],
};

export default config;
