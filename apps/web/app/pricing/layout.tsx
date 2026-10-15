import type { ReactNode } from "react";

export default function PricingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        @media (max-width: 920px) {
          .pricing-shell > header.header {
            position: sticky !important;
            top: 0 !important;
            z-index: 500 !important;
          }

          .pricing-shell .mobile-menu {
            display: block !important;
            position: relative !important;
            z-index: 510 !important;
          }

          .pricing-shell .mobile-menu summary {
            position: relative !important;
            z-index: 514 !important;
            font-size: 0 !important;
          }

          /* Compact three-line icon, matching the landing-page menu more closely. */
          .pricing-shell .mobile-menu:not([open]) summary::before {
            content: "" !important;
            width: 18px !important;
            height: 12px !important;
            display: block !important;
            background:
              linear-gradient(#bfefff,#bfefff) 0 0 / 18px 1.5px no-repeat,
              linear-gradient(#bfefff,#bfefff) 0 5px / 18px 1.5px no-repeat,
              linear-gradient(#bfefff,#bfefff) 0 10px / 18px 1.5px no-repeat !important;
            transform: none !important;
          }

          .pricing-shell .mobile-menu[open] summary::before {
            content: "×" !important;
            width: auto !important;
            height: auto !important;
            display: block !important;
            background: none !important;
            color: #dffbff !important;
            font-size: 25px !important;
            font-weight: 400 !important;
            line-height: 1 !important;
            transform: none !important;
          }

          /* Keep the page visible behind the menu, as on the landing page. */
          .pricing-shell .mobile-menu[open]::before {
            content: "" !important;
            position: fixed !important;
            inset: 60px 0 0 !important;
            background: rgba(3, 10, 19, 0.34) !important;
            backdrop-filter: blur(2px) !important;
            z-index: 511 !important;
            pointer-events: none !important;
          }

          .pricing-shell .mobile-menu-panel {
            position: fixed !important;
            top: 68px !important;
            right: 16px !important;
            bottom: auto !important;
            left: auto !important;
            width: min(300px, calc(100vw - 32px)) !important;
            min-height: 0 !important;
            max-height: calc(100dvh - 84px) !important;
            padding: 10px !important;
            border: 1px solid rgba(89, 230, 255, 0.2) !important;
            border-radius: 16px !important;
            background: rgba(7, 20, 35, 0.985) !important;
            box-shadow: 0 24px 70px rgba(0, 0, 0, 0.42) !important;
            backdrop-filter: blur(22px) !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 4px !important;
            z-index: 513 !important;
            overflow-y: auto !important;
          }

          .pricing-shell .mobile-menu-panel a {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: auto !important;
            min-height: 46px !important;
            padding: 0 13px !important;
            border: 0 !important;
            border-radius: 10px !important;
            background: transparent !important;
            color: #c9d8e7 !important;
            font-size: 14px !important;
            font-weight: 700 !important;
            line-height: 1.2 !important;
            text-indent: 0 !important;
            overflow: visible !important;
          }

          .pricing-shell .mobile-menu-panel a:not(.mobile-primary)::after {
            content: "→" !important;
            color: #67e8f9 !important;
            font-weight: 800 !important;
          }

          .pricing-shell .mobile-menu-panel a.mobile-primary {
            margin-top: 6px !important;
            min-height: 48px !important;
            justify-content: center !important;
            border: 0 !important;
            background: linear-gradient(135deg, #7af0ff, #31d4ed) !important;
            color: #05121f !important;
            box-shadow: 0 10px 28px rgba(49, 212, 237, 0.13) !important;
          }
        }

        @media (max-width: 560px) {
          .pricing-shell .mobile-menu-panel {
            top: 66px !important;
            right: 10px !important;
            width: min(290px, calc(100vw - 20px)) !important;
            max-height: calc(100dvh - 76px) !important;
            padding: 9px !important;
          }

          .pricing-shell .mobile-menu-panel a {
            min-height: 44px !important;
            font-size: 13.5px !important;
            padding: 0 12px !important;
          }
        }
      `}</style>
      {children}
    </>
  );
}
