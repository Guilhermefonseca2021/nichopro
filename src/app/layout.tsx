import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NichoPro | Acesse sua conta",
  description: "Entre na sua conta NichoPro e encontre prompts para o seu negócio.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
