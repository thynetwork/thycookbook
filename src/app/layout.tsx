import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}