import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Redimensionador de Imagens",
  description: "Processamento 100% no seu navegador.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning é necessário para o next-themes funcionar sem avisos
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} transition-colors duration-300 dark:bg-slate-950`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}