import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LifeCost Quiz - Annual Cost Estimator",
  description: "Calculate your annual cost of living based on your lifestyle choices",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}

