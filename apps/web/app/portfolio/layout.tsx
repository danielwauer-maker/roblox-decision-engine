import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Internal portfolio",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export default function PortfolioLayout({ children }: { children: ReactNode }) {
  return children;
}
