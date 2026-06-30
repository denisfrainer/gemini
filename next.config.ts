import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CRÍTICO para SSG e Netlify/Vercel (Static Export)
  output: 'export',

  // Recomendado para melhor compatibilidade com rotas estáticas
  trailingSlash: true,

  // Opcional: Configuração de imagens para Static Export
  images: {
    unoptimized: true,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 90],
  },

  // Experimental: Otimização de CSS para PageSpeed
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
