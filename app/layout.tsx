import type { Metadata } from "next";
import "./globals.css"; 
import { Providers } from "./providers";
import Navbar from "./components/Navbar"; // Import the Navbar we just made

export const metadata: Metadata = {
  title: "EngiSimulation Platform",
  description: "Open Source Engineering Simulations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50 antialiased">
        <Providers>
          <Navbar /> {/* <-- This puts the buttons back! */}
          {children}
        </Providers>
      </body>
    </html>
  );
}