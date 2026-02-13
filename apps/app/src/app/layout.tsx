import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vows — Write wedding vows that sound like you",
  description:
    "Get guided prompts and structure to write personal, meaningful wedding vows. No blank page panic. Your voice, just clearer.",
  openGraph: {
    title: "Vows — Write wedding vows that sound like you",
    description:
      "Get guided prompts and structure to write personal, meaningful wedding vows. No blank page panic. Your voice, just clearer.",
    images: [
      {
        url: "/vows-ogg.jpeg",
        width: 1200,
        height: 630,
        alt: "Vows — Write Better Wedding Vows",
        type: "image/jpeg",
      },
    ],
    siteName: "vows.you",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vows — Write wedding vows that sound like you",
    description:
      "Get guided prompts and structure to write personal, meaningful wedding vows.",
    images: ["/vows-ogg.jpeg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // If Clerk keys are missing (e.g. preview deployments), render without auth
  const hasClerkKeys = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!hasClerkKeys) {
    return (
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${notoSerif.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${notoSerif.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
