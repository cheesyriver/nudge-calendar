import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

const montserrat = Montserrat({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nudge Calendar",
  description: "For students who need a little extra push",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={montserrat.className}>
      <body
        className={montserrat.className}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            themes={['light', 'dark']}
          >
        {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
