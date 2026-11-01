import { JetBrains_Mono, Outfit, Playfair_Display } from "next/font/google";

const publicDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const publicSans = Outfit({
  variable: "--font-sans-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const publicFontVariables = `${publicDisplay.variable} ${publicSans.variable} ${mono.variable}`;
