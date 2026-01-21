/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,tsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0F172A', // Slate 900
          secondary: '#1E293B', // Slate 800
          accent: '#3B82F6',  // Blue 500
          muted: '#64748B',   // Slate 500
        },
        semantic: {
          success: '#10B981', // Emerald 500
          warning: '#F59E0B', // Amber 500
          error: '#EF4444',   // Red 500
          info: '#3B82F6',    // Blue 500
        },
        neutral: {
          surface: '#F8FAFC', // Slate 50
          border: '#E2E8F0',  // Slate 200
          elevated: '#FFFFFF', // White
        }
      },
      spacing: {
        '0': '0',
        'px': '1px',
        'space-0.5': '4px',
        'space-0.75': '6px',
        'space-1': '8px',
        'space-2': '16px',
        'space-3': '24px',
        'space-4': '32px',
        'space-6': '48px',
      },
      maxWidth: {
        'enterprise': '1440px',
        'form': '720px',
      },
      height: {
        'topbar': '56px',
        'row': '44px',
        'header': '48px',
        'footer': '28px',
      },
      width: {
        'sidebar': '240px',
        'evidence': '320px',
        'search': '256px',
        'role-menu': '224px',
      },
      borderRadius: {
        '4': '4px',
        '8': '8px',
        '12': '12px',
      }
    },
  },
  plugins: [],
}
