import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        <title>Aii Top-Up — Top-Up Game Roblox & Mobile Legends Termurah & Terpercaya</title>

        {/* Google Search Console Verification Meta Tags */}
        <meta name="google-site-verification" content="C290PUOCNQnEsN_PN9mtwuUnaqbIvpfi-m0yiYzR6as" />
        <meta name="google-site-verification" content="googlef67bd33cbb0477ca" />

        {/* SEO Meta Tags */}
        <meta name="description" content="Situs resmi Aii Top-Up. Top-up Robux Roblox via Gamepass/Login & Diamond Mobile Legends termurah se-Indonesia. Proses kilat & aman via WhatsApp 24/7." />
        <meta name="keywords" content="aii topup, top up roblox, top up robux murah, top up mobile legends, diamond ml murah, gamepass roblox, topup game via whatsapp" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://house-game-store.aarum1217.workers.dev/" />
        <link rel="manifest" href="/manifest.json" />

        {/* OpenGraph / Facebook SEO */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://house-game-store.aarum1217.workers.dev/" />
        <meta property="og:title" content="Aii Top-Up — Top-Up Game Roblox & Mobile Legends Termurah" />
        <meta property="og:description" content="Top-up Robux Roblox via Gamepass/Login & Diamond Mobile Legends termurah. Proses kilat & aman 24 jam via WhatsApp." />
        <meta property="og:image" content="https://house-game-store.aarum1217.workers.dev/assets/images/Housegame.png" />

        {/* Twitter Card SEO */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Aii Top-Up — Top-Up Game Termurah & Terpercaya" />
        <meta name="twitter:description" content="Top-up Robux Roblox & Diamond Mobile Legends termurah via WhatsApp." />
        <meta name="twitter:image" content="https://house-game-store.aarum1217.workers.dev/assets/images/Housegame.png" />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
