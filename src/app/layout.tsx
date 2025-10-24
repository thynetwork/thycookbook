import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import ToastProvider from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "ThyCookbook",
  description: "ThyCookbook brings the world's cuisines together with lively sections and influencer videos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <SessionProvider>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <ToastProvider />
        </SessionProvider>
      </body>
    </html>
  );
}