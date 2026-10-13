"use client";

import { useEffect } from "react";

const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export default function MarketingAttribution() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    for (const key of keys) {
      const value = params.get(key);
      if (value) sessionStorage.setItem(`playdirective_${key}`, value.slice(0, 240));
    }
    if (document.referrer && !sessionStorage.getItem("playdirective_referrer")) {
      sessionStorage.setItem("playdirective_referrer", document.referrer.slice(0, 1000));
    }
    if (!sessionStorage.getItem("playdirective_landing_page")) {
      sessionStorage.setItem("playdirective_landing_page", window.location.href.slice(0, 1000));
    }
  }, []);

  return null;
}
