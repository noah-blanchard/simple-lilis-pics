import {
  Cormorant_Garamond,
  JetBrains_Mono,
  Lexend_Deca,
  Outfit,
  Playfair_Display,
} from "next/font/google";

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

const adminDisplay = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const adminSans = Lexend_Deca({
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
export const adminFontVariables = `${adminDisplay.variable} ${adminSans.variable} ${mono.variable}`;
