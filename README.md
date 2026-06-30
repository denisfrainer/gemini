# Vibe Coder Boilerplate

A high-performance, i18n-ready starter kit built with **Next.js 16**, **TailwindCSS 4**, and **TypeScript**. Designed to clone and launch client websites (hotels, restaurants, shops) in under 24 hours.

## ⚡ Features

- **PageSpeed 99+** — SSG (Static Site Generation) out of the box
- **Multi-language (i18n)** — PT / EN / ES with `next-intl`, add more by creating a JSON file
- **Dark Mode Design System** — CSS custom properties, ready to theme
- **Optimized Fonts** — Google Fonts (Space Grotesk + Source Sans 3) via `next/font`
- **SEO Ready** — Meta tags, Open Graph, semantic HTML
- **Minimal & Clean** — Only the essentials, zero bloat

## 🛠 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16 | Framework (App Router, SSG) |
| React | 19 | UI Library |
| TailwindCSS | 4 | Styling |
| next-intl | 4 | Internationalization |
| lucide-react | — | Icons |
| TypeScript | 5 | Type Safety |

## 🚀 Quick Start

```bash
# 1. Clone the repo
git clone <your-repo-url> my-client-site
cd my-client-site

# 2. Install dependencies
npm install

# 3. Run the dev server
npm run dev

# 4. Open in browser
# http://localhost:3000
```

## 📁 Project Structure

```
├── app/
│   ├── [lang]/          # i18n dynamic routes
│   │   ├── layout.tsx   # NextIntlClientProvider wrapper
│   │   └── page.tsx     # Main page (Hero + Features + CTA)
│   ├── globals.css      # Design system (CSS variables)
│   ├── layout.tsx       # Root layout (fonts, metadata)
│   └── page.tsx         # Root redirect → /pt
├── components/
│   ├── Header.tsx       # Navigation bar + mobile menu
│   ├── HeroSection.tsx  # Hero section
│   ├── FeaturesSection.tsx # 3-column feature cards
│   ├── CTASection.tsx   # Call to action
│   ├── Footer.tsx       # Footer
│   ├── LanguageSwitcher.tsx # Language dropdown
│   └── MessagesProvider.tsx # i18n client provider
├── locales/
│   ├── en.json          # English translations
│   ├── pt.json          # Portuguese translations
│   └── es.json          # Spanish translations
├── lib/
│   └── utils.ts         # Tailwind class merge utility
├── i18n.ts              # next-intl configuration
├── middleware.ts        # i18n routing middleware
└── next.config.ts       # Next.js config (SSG, optimizeCss)
```

## 🌐 Adding a New Language

1. Create `locales/fr.json` (copy structure from `en.json`)
2. Add `'fr'` to the `locales` array in `i18n.ts`
3. Update the matcher in `middleware.ts` to include `fr`
4. Done! Visit `/fr` to see it

## 🎨 Customizing the Design

All design tokens live in `app/globals.css` as CSS custom properties:

```css
:root {
  --background: #000000;
  --foreground: #ededed;
  --primary: #1E1E1E;
  --accent-blue: #404EED;
  /* ... */
}
```

Change these values to instantly re-theme the entire site.

## 📦 Build for Production

```bash
npm run build
```

Output goes to `out/` — ready to deploy to Netlify, Vercel, or any static host.

## 📄 License

MIT
