import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo, Amiri, Tajawal, Noto_Sans_Arabic, El_Messiri, Lateef, Scheherazade_New, Jomhuria, Aref_Ruqaa, Katibeh } from "next/font/google";
import { AuthProvider } from "@/hooks/useAuth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Arabic Fonts
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const elMessiri = El_Messiri({
  variable: "--font-el-messiri",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lateef = Lateef({
  variable: "--font-lateef",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const scheherazadeNew = Scheherazade_New({
  variable: "--font-scheherazade-new",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jomhuria = Jomhuria({
  variable: "--font-jomhuria",
  subsets: ["latin"],
  weight: ["400"],
});

const arefRuqaa = Aref_Ruqaa({
  variable: "--font-aref-ruqaa",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const katibeh = Katibeh({
  variable: "--font-katibeh",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Identity Maker - صانع الهويات",
  description: "أنشئ تصاميم هوية فريدة ومحترفة بسهولة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} ${amiri.variable} ${tajawal.variable} ${notoSansArabic.variable} ${elMessiri.variable} ${lateef.variable} ${scheherazadeNew.variable} ${jomhuria.variable} ${arefRuqaa.variable} ${katibeh.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
