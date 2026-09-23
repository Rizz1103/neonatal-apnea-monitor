/* =========================================================
   NEONATAL APNEA EDGE MONITOR
   GLOBAL NAVIGATION SYSTEM
   ========================================================= */

(function () {
  "use strict";

  function websiteRoot() {
    var pathname = window.location.pathname;
    var marker = "/pages/";
    var index = pathname.indexOf(marker);
    if (index !== -1) {
      return pathname.substring(0, index + 1);
    }
    return pathname.endsWith("/") ? pathname : pathname.substring(0, pathname.lastIndexOf("/") + 1);
  }

  function goTo(path) {
    window.location.href = websiteRoot() + path;
  }

  window.MonitorNavigation = {
    goToOverview: function () { goTo("index.html"); },
    goToLiveMonitoring: function () { goTo("pages/live-monitoring.html"); },
    goToEdgeAI: function () { goTo("pages/edge-ai.html"); },
    goToMethodology: function () { goTo("pages/methodology.html"); },
    goToPrecursorModeling: function () { goTo("pages/precursor-modeling.html"); },
    goToHardware: function () { goTo("pages/hardware.html"); }
  };

  function setupNavigation() {
    var links = document.querySelectorAll("[data-path]");

    links.forEach(function (link) {
      var path = link.getAttribute("data-path");
      link.addEventListener("click", function (event) {
        event.preventDefault();
        if (path === "overview") MonitorNavigation.goToOverview();
        else if (path === "live-monitoring") MonitorNavigation.goToLiveMonitoring();
        else if (path === "edge-ai") MonitorNavigation.goToEdgeAI();
        else if (path === "methodology" || path === "signals" || path === "events" || path === "risk-history") MonitorNavigation.goToMethodology();
        else if (path === "precursor-modeling") MonitorNavigation.goToPrecursorModeling();
        else if (path === "hardware") MonitorNavigation.goToHardware();
      });
    });

    updateActiveNavigation();
    startClock();
  }

  function updateActiveNavigation() {
    var links = document.querySelectorAll("[data-path]");
    var pathname = window.location.pathname.toLowerCase();

    links.forEach(function (link) {
      var path = link.getAttribute("data-path");
      link.classList.remove("bg-surface-container-high", "text-primary", "border-t-2", "border-primary", "nav-active");
      link.classList.add("text-on-surface-variant");
      link.removeAttribute("aria-current");

      var isActive = false;
      if (pathname.indexOf("/pages/live-monitoring") !== -1 && path === "live-monitoring") isActive = true;
      else if (pathname.indexOf("/pages/edge-ai") !== -1 && path === "edge-ai") isActive = true;
      else if (pathname.indexOf("/pages/methodology") !== -1 && (path === "methodology" || path === "signals" || path === "events" || path === "risk-history")) isActive = true;
      else if (pathname.indexOf("/pages/precursor-modeling") !== -1 && path === "precursor-modeling") isActive = true;
      else if (pathname.indexOf("/pages/hardware") !== -1 && path === "hardware") isActive = true;
      else if ((pathname.endsWith("index.html") || pathname.endsWith("/")) && path === "overview") isActive = true;

      if (isActive) {
        link.classList.remove("text-on-surface-variant");
        link.classList.add("bg-surface-container-high", "text-primary", "border-t-2", "border-primary", "nav-active");
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function startClock() {
    var clockEl = document.getElementById("utc-clock-val");
    if (!clockEl) {
      var spans = document.querySelectorAll("span");
      spans.forEach(function (s) {
        if (s.textContent && s.textContent.trim().match(/^\d{2}:\d{2}:\d{2}/)) {
          clockEl = s;
        }
      });
    }

    function tick() {
      var now = new Date();
      var h = String(now.getUTCHours()).padStart(2, "0");
      var m = String(now.getUTCMinutes()).padStart(2, "0");
      var s = String(now.getUTCSeconds()).padStart(2, "0");
      var ms = String(now.getUTCMilliseconds()).padStart(3, "0");
      var str = h + ":" + m + ":" + s + "." + ms;
      if (clockEl) clockEl.textContent = str;
    }
    setInterval(tick, 100);
    tick();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupNavigation);
  } else {
    setupNavigation();
  }
})();