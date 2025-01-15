import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            screens: {
                sm: '640px',
                md: '768px',
                lg: '1024px',
                xl: '1280px',
              },        
            boxShadow: {
                subscription: '0px 0px 6px 2px rgba(0, 0, 0, 0.25)',
                sideNavbarClients: '3px 4px 5px 0px rgba(0, 0, 0, 0.25)',
                socialNetworks:
                    '0px 1px 3px 0px rgba(50, 50, 71, 0.10), 0px 0px 1px 0px rgba(12, 26, 75, 0.20)',
            },
            spacing: {
                '38': '38px',
                '12p': '12px',
            },
            fontSize: {
                '40p': '40px',
            },
            fontFamily: {
                primary: [
                    'var(--font-montserrat)',
                    ...defaultTheme.fontFamily.sans,
                ],
                poppins: ['var(--font-poppins)'],
            },
            colors: {
                primary: '#FDD500',
                dark: '#122330',
                elegant: '#333333',
                light: '#fdffff',
                red: '#ff0000',
                ipsum: '#384FF6',
                alternative: '#FDD500',
                coolGrey: '#DDE1EB',
                muted: '#7A828A',
                camposDark: '#E6E8EC',
                greyJupiter: '#363940',
                warningOrange: '#fcba03',
                veryDark: '#141416',
                info: '#117a8b',
                bluec: '33850FB',
            },
            keyframes: {
                flicker: {
                    '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': {
                        opacity: '0.99',
                        filter: 'drop-shadow(0 0 1px rgba(252, 211, 77)) drop-shadow(0 0 15px rgba(245, 158, 11)) drop-shadow(0 0 1px rgba(252, 211, 77))',
                    },
                    '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': {
                        opacity: '0.4',
                        filter: 'none',
                    },
                },
                shimmer: {
                    '0%': {
                        backgroundPosition: '-700px 0',
                    },
                    '100%': {
                        backgroundPosition: '700px 0',
                    },
                },
            },
            animation: {
                flicker: 'flicker 3s linear infinite',
                shimmer: 'shimmer 1.3s linear infinite',
            },
        },
    },
    variants: {
        fill: ['hover', 'focus'], // this line does the trick
    },
    plugins: [require('@tailwindcss/forms')],
} satisfies Config;
