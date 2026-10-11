import type { ReactNode } from "react";

export const metadata = {
  title: "Roblox Decision Engine",
  description: "AI Product & Growth Analyst for Roblox studios",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
