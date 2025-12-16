import type { Metadata } from "next";
import { SkipLink } from "@/components/a11y/SkipLink";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Klinik Randevu Yönetim Sistemi",
    template: "%s | Klinik Randevu",
  },
  description: "Modern, erişilebilir ve responsive diş kliniği randevu yönetim sistemi",
  keywords: [
    "randevu",
    "klinik",
    "doktor",
    "diş",
    "yönetim",
    "sistem",
    "scheduling",
  ],
  authors: [{ name: "Clinic Management Team" }],
  openGraph: {
    title: "Klinik Randevu Yönetim Sistemi",
    description: "Modern, erişilebilir ve responsive diş kliniği randevu yönetim sistemi",
    type: "website",
    locale: "tr_TR",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

const themeInitScript = `
(() => {
  try {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored ?? (prefersDark ? "dark" : "light");
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  } catch (_) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
