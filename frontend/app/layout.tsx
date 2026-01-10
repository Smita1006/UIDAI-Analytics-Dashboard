import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UIDAI Analytics Dashboard",
  description:
    "Advanced analytics dashboard for UIDAI Aadhaar data with ML insights and predictive analytics",
  keywords:
    "UIDAI, Aadhaar, Analytics, Dashboard, Machine Learning, Government, Data Visualization",
  authors: [{ name: "UIDAI Analytics Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className={inter.className}>
        <QueryProvider>
          <div className="min-h-screen bg-background">{children}</div>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
