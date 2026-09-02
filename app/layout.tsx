import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { DeviceProvider, ThemeProvider } from "@/contexts";
import cn from "clsx";
import styles from "./layout.module.css";
import Header from "../_components/Header/Header";

const robotoFont = Roboto({
  variable: "--font-roboto",
  subsets: ["latin", "cyrillic"],
});

const robotoMonoFont = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Dream diary",
  description: "Dream diary",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ThemeProvider>
        <DeviceProvider>
          <body
            className={cn([
              robotoFont.variable,
              robotoMonoFont.variable,
              styles.body
            ])}
          >
            <Header />
            <main className={styles.main}>
              {children}
            </main>
          </body>
        </DeviceProvider>
      </ThemeProvider>
    </html>
  );
}
