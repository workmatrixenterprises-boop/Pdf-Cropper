import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "PDF Cropper",
  description: "Ecommerce label cropper tools",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 text-zinc-900">
        <Header />

        <main className="mx-auto max-w-6xl px-4 py-8">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
