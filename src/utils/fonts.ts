import { Dela_Gothic_One, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

export const IBMPlexSans = IBM_Plex_Sans({
    subsets: ["latin"],
    variable: "--font-IBM-plex-sans",
    weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const IBMPlexMono = IBM_Plex_Mono({
    subsets: ["latin"],
    variable: "--font-IBM-plex-mono",
    weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const delaGothicOne = Dela_Gothic_One({
    subsets: ["latin"],
    variable: "--font-dela-gothic",
    weight: "400",
});
