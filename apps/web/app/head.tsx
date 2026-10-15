export default function Head() {
  return (
    <>
      <style>{`
        @media (max-width: 920px) {
          /* Shared public mobile navigation control. All public pages use the same
             centered three-line hamburger and the same X state when open. */
          body details.global-mobile-menu > summary,
          body details.mobile-menu > summary {
            position: relative !important;
            width: 40px !important;
            height: 40px !important;
            min-width: 40px !important;
            min-height: 40px !important;
            padding: 0 !important;
            margin: 0 !important;
            list-style: none !important;
            border: 1px solid rgba(89,230,255,.30) !important;
            border-radius: 11px !important;
            background: rgba(8,24,40,.94) !important;
            box-shadow: 0 10px 30px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.04) !important;
            color: transparent !important;
            font-size: 0 !important;
            line-height: 0 !important;
            display: block !important;
            cursor: pointer !important;
            -webkit-tap-highlight-color: transparent !important;
          }

          body details.global-mobile-menu > summary::-webkit-details-marker,
          body details.mobile-menu > summary::-webkit-details-marker {
            display: none !important;
          }

          body details.global-mobile-menu > summary > span,
          body details.mobile-menu > summary > span {
            display: none !important;
          }

          body details.global-mobile-menu > summary::before,
          body details.mobile-menu > summary::before {
            content: "" !important;
            position: absolute !important;
            left: 50% !important;
            top: 50% !important;
            width: 18px !important;
            height: 1.5px !important;
            border-radius: 999px !important;
            background: #bfefff !important;
            box-shadow: 0 -5px 0 #bfefff, 0 5px 0 #bfefff !important;
            transform: translate(-50%, -50%) !important;
            transform-origin: center !important;
            transition: transform .18s ease, box-shadow .18s ease !important;
          }

          body details.global-mobile-menu > summary::after,
          body details.mobile-menu > summary::after {
            content: "" !important;
            position: absolute !important;
            left: 50% !important;
            top: 50% !important;
            width: 18px !important;
            height: 1.5px !important;
            border-radius: 999px !important;
            background: #bfefff !important;
            opacity: 0 !important;
            transform: translate(-50%, -50%) rotate(-45deg) !important;
            transform-origin: center !important;
            transition: opacity .18s ease, transform .18s ease !important;
          }

          body details.global-mobile-menu[open] > summary::before,
          body details.mobile-menu[open] > summary::before {
            box-shadow: none !important;
            transform: translate(-50%, -50%) rotate(45deg) !important;
          }

          body details.global-mobile-menu[open] > summary::after,
          body details.mobile-menu[open] > summary::after {
            opacity: 1 !important;
          }

          /* Same floating menu treatment on landing and page-specific public menus. */
          body details.global-mobile-menu[open]::before,
          body details.mobile-menu[open]::before {
            content: "" !important;
            position: fixed !important;
            inset: 60px 0 0 !important;
            background: rgba(3,10,19,.34) !important;
            backdrop-filter: blur(2px) !important;
            pointer-events: none !important;
            z-index: 118 !important;
          }

          body details.global-mobile-menu > .mobile-menu-panel,
          body details.mobile-menu > .mobile-menu-panel {
            position: fixed !important;
            top: 68px !important;
            right: 14px !important;
            left: auto !important;
            width: min(300px, calc(100vw - 28px)) !important;
            max-width: 300px !important;
            min-height: 0 !important;
            padding: 10px !important;
            border: 1px solid rgba(89,230,255,.21) !important;
            border-radius: 16px !important;
            background: rgba(7,20,35,.985) !important;
            box-shadow: 0 24px 70px rgba(0,0,0,.46) !important;
            backdrop-filter: blur(22px) !important;
            display: grid !important;
            gap: 3px !important;
            z-index: 119 !important;
          }

          body details.global-mobile-menu > .mobile-menu-panel a,
          body details.mobile-menu > .mobile-menu-panel a {
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
            text-decoration: none !important;
            text-indent: 0 !important;
            font-size: 14px !important;
            font-weight: 700 !important;
            line-height: 1.2 !important;
          }

          body details.global-mobile-menu > .mobile-menu-panel a:not(.mobile-menu-cta):not(.mobile-primary)::after,
          body details.mobile-menu > .mobile-menu-panel a:not(.mobile-menu-cta):not(.mobile-primary)::after {
            content: "→" !important;
            color: #67e8f9 !important;
            font-weight: 800 !important;
          }

          body details.global-mobile-menu > .mobile-menu-panel a.mobile-menu-cta,
          body details.mobile-menu > .mobile-menu-panel a.mobile-primary {
            margin-top: 6px !important;
            min-height: 48px !important;
            justify-content: center !important;
            background: linear-gradient(135deg,#7af0ff,#31d4ed) !important;
            color: #05121f !important;
            box-shadow: 0 10px 28px rgba(49,212,237,.13) !important;
          }

          /* Root-level shared menu is available on public pages that do not have a
             page-specific mobile menu yet. */
          body:has(> main.site-shell) > details.global-mobile-menu,
          body:has(> main.apply-shell) > details.global-mobile-menu,
          body:has(> main.help-shell) > details.global-mobile-menu,
          body:has(> main.legal-shell) > details.global-mobile-menu,
          body:has(> main.demo-shell) > details.global-mobile-menu {
            display: block !important;
            position: fixed !important;
            right: 14px !important;
            top: 12px !important;
            z-index: 120 !important;
            font-family: Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif !important;
            color: #eef7ff !important;
          }
        }

        @media (max-width: 560px) {
          body details.global-mobile-menu > summary,
          body details.mobile-menu > summary {
            width: 38px !important;
            height: 38px !important;
            min-width: 38px !important;
            min-height: 38px !important;
            border-radius: 10px !important;
          }

          body details.global-mobile-menu > summary::before,
          body details.global-mobile-menu > summary::after,
          body details.mobile-menu > summary::before,
          body details.mobile-menu > summary::after {
            width: 17px !important;
          }

          body details.global-mobile-menu > .mobile-menu-panel,
          body details.mobile-menu > .mobile-menu-panel {
            top: 64px !important;
            right: 10px !important;
            width: min(290px, calc(100vw - 20px)) !important;
            max-width: 290px !important;
            padding: 9px !important;
          }

          body details.global-mobile-menu > .mobile-menu-panel a,
          body details.mobile-menu > .mobile-menu-panel a {
            min-height: 44px !important;
            padding: 0 12px !important;
            font-size: 13.5px !important;
          }

          body:has(> main.site-shell) > details.global-mobile-menu,
          body:has(> main.apply-shell) > details.global-mobile-menu,
          body:has(> main.help-shell) > details.global-mobile-menu,
          body:has(> main.legal-shell) > details.global-mobile-menu,
          body:has(> main.demo-shell) > details.global-mobile-menu {
            right: 10px !important;
            top: 10px !important;
          }
        }
      `}</style>
    </>
  );
}
