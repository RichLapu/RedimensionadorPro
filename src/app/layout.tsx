import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Redimensionador Pro | Otimização de Imagens no Browser",
  description: "Redimensione, comprima, recorte e adicione marcas d'água em lote. Processamento rápido, seguro e 100% privado diretamente no seu navegador.",
  keywords: ["redimensionar imagem", "compressão", "marca d'água", "crop", "processamento em lote", "Next.js", "React", "Portfólio"],
  authors: [{ name: "Richard Lapuente", url: "https://www.linkedin.com/in/richard-lapuente/" }],
  openGraph: {
    title: "Redimensionador Pro | Otimização de Imagens",
    description: "Redimensione, comprima, recorte e adicione marcas d'água em lote. Processamento 100% privado no seu navegador.",
    url: "https://redimensionador-pro.vercel.app/",
    siteName: "Redimensionador Pro",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Redimensionador Pro | Otimização de Imagens",
    description: "Processamento rápido e privado de imagens no navegador.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} transition-colors duration-300 dark:bg-slate-950`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}