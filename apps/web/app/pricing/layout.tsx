import type { ReactNode } from "react";

export default function PricingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        @media (max-width: 920px) {
          /* Pricing keeps the same shared mobile menu as every public page.
             Only repair this page's local stacking context here. */
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

          .pricing-shell .mobile-menu > summary {
            z-index: 514 !important;
          }

          .pricing-shell .mobile-menu[open]::before {
            z-index: 511 !important;
          }

          .pricing-shell .mobile-menu > .mobile-menu-panel {
            z-index: 513 !important;
          }
        }
      `}</style>
      {children}
    </>
  );
}
