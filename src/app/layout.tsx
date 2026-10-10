import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "DTA Drafting Hub",
    template: "%s | DTA Drafting Hub",
  },
  description:
    "Professional document drafting and document-support services built around clarity, trust, and precision.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=lufga@400,500,800&display=swap"
        />
      </head>
      <body className="flex min-h-full flex-col bg-surface font-sans text-ink">
        {children}
      </body>
    </html>
  );
}
