import type { Metadata } from "next";
import { Geist_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import ClientBody from "@/components/ClientBody";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "Real Rise",
  description: "Personal Dashboard für Habits, Goals, OKRs und persönliche Entwicklung",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon-v2.svg",
    apple: "/apple-touch-icon-v3.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Real Rise",
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Real Rise" />
        <meta name="theme-color" content="#0A0A0F" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
      </head>
      <body suppressHydrationWarning>
        <ClientBody className={`${geistMono.variable} ${orbitron.variable} antialiased font-mona-regular`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ClerkProvider
              dynamic
              appearance={{
                baseTheme: dark,
                variables: {
                  colorPrimary: "#ffffff",
                  colorBackground: "#000000",
                  colorInputBackground: "#1a1a1a",
                  colorInputText: "#ffffff",
                  colorText: "#ffffff",
                  colorTextSecondary: "#b3b3b3",
                  colorNeutral: "#3a3a3a",
                  colorDanger: "#dc2626",
                  colorSuccess: "#10b981",
                  colorWarning: "#f59e0b",
                  borderRadius: "0.625rem",
                },
                elements: {
                  card: "bg-[#1a1a1a] border-[#3a3a3a]",
                  headerTitle: "text-white",
                  headerSubtitle: "text-[#b3b3b3]",
                  socialButtonsBlockButton: "border-[#3a3a3a] hover:bg-[#2a2a2a]",
                  formButtonPrimary: "bg-white text-black hover:bg-gray-200",
                  formFieldInput: "bg-[#1a1a1a] border-[#3a3a3a] text-white",
                  footerActionLink: "text-white hover:text-gray-300",
                }
              }}
            >
              <ConvexClientProvider>{children}</ConvexClientProvider>
              <Toaster richColors position="bottom-right" />
            </ClerkProvider>
          </ThemeProvider>
        </ClientBody>
      </body>
    </html>
  );
}
