import { Outfit, Playfair_Display } from "next/font/google";

// Same families and variables as the portfolio (apps/web/src/lib/fonts.ts);
// the wedding site drops the mono face because it never sets mono type.
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
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const publicFontVariables = `${publicDisplay.variable} ${publicSans.variable}`;
