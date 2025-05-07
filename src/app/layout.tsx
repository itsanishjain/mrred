import "./globals.css";
import { bricolage } from "@/lib/fonts";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Progress from "@/components/ProgressBar";

export const metadata: Metadata = {
  title: "Passport - Driving Instructor App",
  description: "Connect with qualified driving instructors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={bricolage.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Progress />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
