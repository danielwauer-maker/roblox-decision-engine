import type { ReactNode } from "react";

export default function PricingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        @media (max-width: 920px) {
          /* The pricing page gives all top-level sections z-index:1. That previously
             collapsed the sticky header into the same stacking level as the hero,
             so the hero could paint on top of the opened mobile navigation. */
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
          }

          .pricing-shell .mobile-menu[open]::before {
            content: "" !important;
            position: fixed !important;
            inset: 60px 0 0 !important;
            background: #06101e !important;
            z-index: 511 !important;
            pointer-events: none !important;
          }

          .pricing-shell .mobile-menu-panel {
            position: fixed !important;
            inset: 60px 0 0 0 !important;
            width: 100vw !important;
            max-width: none !important;
            min-height: calc(100dvh - 60px) !important;
            padding: 18px 14px 28px !important;
            border: 0 !important;
            border-top: 1px solid rgba(89, 230, 255, 0.16) !important;
            border-radius: 0 !important;
            background: #06101e !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
            z-index: 513 !important;
            overflow-y: auto !important;
          }

          /* Extra safety: while the drawer is open, page content beneath it is not
             painted. This prevents any future stacking-context regression. */
          .pricing-shell:has(.mobile-menu[open]) > section,
          .pricing-shell:has(.mobile-menu[open]) > footer,
          .pricing-shell:has(.mobile-menu[open]) > img.deco {
            visibility: hidden !important;
          }

          .pricing-shell .mobile-menu-panel a {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 100% !important;
            min-height: 52px !important;
            padding: 0 15px !important;
            border: 1px solid rgba(91, 169, 217, 0.18) !important;
            border-radius: 12px !important;
            background: #0a192b !important;
            color: #d5e2ee !important;
            font-size: 14px !important;
            font-weight: 750 !important;
            line-height: 1.2 !important;
            text-indent: 0 !important;
            overflow: visible !important;
          }

          .pricing-shell .mobile-menu-panel a:not(.mobile-primary)::after {
            content: "→" !important;
            color: #67e8f9 !important;
            font-weight: 900 !important;
          }

          .pricing-shell .mobile-menu-panel a.mobile-primary {
            margin-top: 8px !important;
            min-height: 54px !important;
            justify-content: center !important;
            border-color: transparent !important;
            background: linear-gradient(135deg, #7af0ff, #31d4ed) !important;
            color: #05121f !important;
            box-shadow: 0 12px 32px rgba(49, 212, 237, 0.13) !important;
          }
        }

        @media (max-width: 560px) {
          .pricing-shell .mobile-menu-panel {
            inset: 60px 0 0 0 !important;
            padding: 16px 12px 24px !important;
          }

          .pricing-shell .mobile-menu-panel a {
            min-height: 50px !important;
            font-size: 13.5px !important;
            padding: 0 14px !important;
          }
        }
      `}</style>
      {children}
    </>
  );
}
