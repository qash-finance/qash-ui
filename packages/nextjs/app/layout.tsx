import type { Metadata } from "next";
import { Geist, Geist_Mono, Barlow, Nanum_Pen_Script } from "next/font/google";
import "./globals.css";
import ClientLayout from "../components/ClientLayout";
import localFont from "next/font/local";
import { ThemeProvider } from "@/contexts/ThemeProvider";

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

const Complain = localFont({
  src: "../public/fonts/complain-bold.otf",
  variable: "--font-complain",
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
const nanumPenScript = Nanum_Pen_Script({
  weight: "400",
  variable: "--font-nanum-pen-script",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "Qash",
  description:
    "Private neobank for global teams to run payroll, earn yield, and spend across chains and currencies without exposing sensitive information onchain.",
  icons: {
    icon: "/logo/qash-icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet" />
        {/* This is a hack to ensure the theme is applied correctly on the server side */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('ui-theme') || 'light';
                  if (theme === 'system') {
                    var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    document.documentElement.classList.add(systemTheme);
                  } else {
                    document.documentElement.classList.add(theme);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${barlow.className} ${repetitionScrolling.variable} ${nanumPenScript.variable} antialiased`}
      >
        <ThemeProvider defaultTheme="light" storageKey="ui-theme">
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
