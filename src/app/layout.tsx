import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";

import { cn, constructMetadata } from "@/lib/utils";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Provider";

import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      className='h-full'
    >
      <body
        className={cn(
          "relative h-full font-sans antialiased",
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <main className='relative flex min-h-screen flex-col'>
          <Providers>
            <Navbar />
            <div className='flex-1 flex-grow'>{children}</div>
            <Footer />
          </Providers>
        </main>

        <Toaster
          position='top-center'
          richColors
        />
      </body>
    </html>
  );
}
