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
        <meta name="keywords" content="aii topup, top up roblox, top up robux murah, top up mobile legends, diamond ml murah, gamepass roblox, topup game via whatsapp, top up game 24 jam" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Aii Top-Up" />
        <meta name="theme-color" content="#e88eb5" />
        <link rel="canonical" href="https://house-game-store.vercel.app/" />
        <link rel="manifest" href="/manifest.json" />

        {/* OpenGraph / Facebook SEO */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Aii Top-Up" />
        <meta property="og:locale" content="id_ID" />
        <meta property="og:url" content="https://house-game-store.vercel.app/" />
        <meta property="og:title" content="Aii Top-Up — Top-Up Game Roblox & Mobile Legends Termurah" />
        <meta property="og:description" content="Top-up Robux Roblox via Gamepass/Login & Diamond Mobile Legends termurah. Proses kilat & aman 24 jam via WhatsApp." />
        <meta property="og:image" content="https://house-game-store.vercel.app/assets/images/Housegame.png" />
        <meta property="og:image:alt" content="Aii Top-Up — Top-up game termurah" />

        {/* Twitter Card SEO */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@Aeezee05" />
        <meta name="twitter:title" content="Aii Top-Up — Top-Up Game Termurah & Terpercaya" />
        <meta name="twitter:description" content="Top-up Robux Roblox & Diamond Mobile Legends termurah via WhatsApp." />
        <meta name="twitter:image" content="https://house-game-store.vercel.app/assets/images/Housegame.png" />
        <meta name="twitter:image:alt" content="Aii Top-Up — Top-up game termurah" />

        {/* Structured Data JSON-LD Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'OnlineStore',
              name: 'Aii Top-Up',
              url: 'https://house-game-store.vercel.app',
              '@id': 'https://house-game-store.vercel.app',
              logo: 'https://house-game-store.vercel.app/assets/images/Housegame.png',
              image: 'https://house-game-store.vercel.app/assets/images/Housegame.png',
              description:
                'Layanan top-up game Roblox Robux dan Mobile Legends Diamond termurah dan terpercaya di Indonesia.',
              telephone: '+62881025426010',
              email: 'aarum1217@gmail.com',
              priceRange: 'Rp15.000 - Rp1.200.000',
              areaServed: 'Indonesia',
              availableLanguage: ['id', 'en'],
              address: { '@type': 'PostalAddress', addressCountry: 'ID' },
              openingHours: 'Mo-Su 00:00-24:00',
              sameAs: [
                'https://instagram.com/Aeezee05',
                'https://wa.me/62881025426010'
              ]
            })
          }}
        />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}