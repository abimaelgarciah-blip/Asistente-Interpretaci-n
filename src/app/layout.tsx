import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Asistente de Interpretación Radiológica",
  description: "Control de calidad de informes de imagenología",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-50 min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
