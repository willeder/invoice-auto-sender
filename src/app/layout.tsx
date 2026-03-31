import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "定期請求書オート送信（モック）",
  description: "定期請求書の生成・送付を管理するモックアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-950">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <div className="flex items-center gap-3">
              <Link href="/" className="font-semibold tracking-tight">
                定期請求書オート送信（モック）
              </Link>
              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-600">
                v0.1
              </span>
            </div>
            <nav className="flex items-center gap-2 text-sm">
              <Link
                href="/clients"
                className="rounded-md px-3 py-2 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
              >
                取引先
              </Link>
              <Link
                href="/invoices"
                className="rounded-md px-3 py-2 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
              >
                請求書
              </Link>
              <Link
                href="/settings"
                className="rounded-md px-3 py-2 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
              >
                設定
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-8">{children}</div>
        </main>
        <footer className="border-t border-zinc-200 bg-white">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 text-xs text-zinc-600">
            モックアプリ（データは開発サーバーのメモリ上で保持されます）
          </div>
        </footer>
      </body>
    </html>
  );
}
