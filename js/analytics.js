/* =========================================================
   analytics.js — Google Analytics (gtag.js) loader
   Measurement ID: G-GEW9G2WFF5
   Loaded async, zero impact on critical rendering.
   ========================================================= */

(function () {
  var GA_ID = "G-GEW9G2WFF5";

  // Respect Do Not Track
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;

  // Inject gtag.js
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  document.head.appendChild(s);

  // Initialize dataLayer + gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_ID, {
    anonymize_ip: true,
    page_path: location.pathname + location.search
  });
})();
