import type { Metadata } from "next";
import { Geist, Geist_Mono, Barlow } from "next/font/google";
import "./globals.css";
import ClientLayout from "../components/ClientLayout";
import localFont from "next/font/local";

const repetitionScrolling = localFont({
  src: "../public/fonts/repet___.ttf",
  variable: "--font-repetition-scrolling",
  display: "swap",
});

const DFVN = localFont({
  src: "../public/fonts/DFVN_36daysoftype.ttf",
  variable: "--font-dfvn",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const barlow = Barlow({
  weight: "500",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "Q3x",
  description: "Q3x",
  icons: {
    icon: "/q3x-icon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${barlow.className} ${repetitionScrolling.variable} antialiased`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
