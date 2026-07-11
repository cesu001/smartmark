// Smark Homepage Mockup — vanilla JS, no dependencies.

(function () {
  "use strict";

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Navbar: opacity on scroll ---------- */
  var navbar = document.getElementById("navbar");
  function onScroll() {
    if (!navbar) return;
    if (window.scrollY > 40) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in-view");
    });
  }

  /* ---------- Pricing: monthly / yearly toggle ---------- */
  var billingSwitch = document.getElementById("billingSwitch");
  var labelMonthly = document.getElementById("labelMonthly");
  var labelYearly = document.getElementById("labelYearly");
  var proOriginalPrice = document.getElementById("proOriginalPrice");
  var proPeriod = document.getElementById("proPeriod");

  if (billingSwitch) {
    var yearly = false;
    if (labelMonthly) labelMonthly.classList.add("active");

    billingSwitch.addEventListener("click", function () {
      yearly = !yearly;
      billingSwitch.setAttribute("aria-checked", String(yearly));
      if (labelMonthly) labelMonthly.classList.toggle("active", !yearly);
      if (labelYearly) labelYearly.classList.toggle("active", yearly);
      if (proOriginalPrice) proOriginalPrice.textContent = yearly ? "$50" : "$5";
      if (proPeriod) proPeriod.textContent = yearly ? "/yr" : "/mo";
    });
  }

  /* ---------- Chaos icons: drift, bounce, repel from cursor ---------- */
  var field = document.getElementById("chaosField");
  if (!field) return;

  var icons = Array.prototype.slice.call(field.querySelectorAll(".chaos-icon"));
  if (!icons.length) return;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var state = icons.map(function () {
    return { x: 0, y: 0, vx: 0, vy: 0, w: 0, h: 0, maxX: 0, maxY: 0, phase: Math.random() * Math.PI * 2, placed: false };
  });

  var mouse = { x: -9999, y: -9999, active: false };

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function layout() {
    var rect = field.getBoundingClientRect();
    icons.forEach(function (icon, i) {
      var s = state[i];
      var w = icon.offsetWidth || 50;
      var h = icon.offsetHeight || 30;
      s.w = w;
      s.h = h;
      s.maxX = Math.max(rect.width - w, 0);
      s.maxY = Math.max(rect.height - h, 0);
      if (!s.placed) {
        s.x = rand(0, s.maxX);
        s.y = rand(0, s.maxY);
        var speed = rand(0.25, 0.55);
        var angle = rand(0, Math.PI * 2);
        s.vx = Math.cos(angle) * speed;
        s.vy = Math.sin(angle) * speed;
        s.placed = true;
      }
    });
  }

  layout();
  window.addEventListener("resize", layout);

  field.addEventListener("mousemove", function (e) {
    var rect = field.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });
  field.addEventListener("mouseleave", function () {
    mouse.active = false;
  });

  var REPEL_RADIUS = 95;
  var REPEL_STRENGTH = 0.55;
  var MAX_SPEED = 1.3;

  function tick() {
    icons.forEach(function (icon, i) {
      var s = state[i];

      s.x += s.vx;
      s.y += s.vy;

      if (s.x <= 0) {
        s.x = 0;
        s.vx = Math.abs(s.vx);
      } else if (s.x >= s.maxX) {
        s.x = s.maxX;
        s.vx = -Math.abs(s.vx);
      }

      if (s.y <= 0) {
        s.y = 0;
        s.vy = Math.abs(s.vy);
      } else if (s.y >= s.maxY) {
        s.y = s.maxY;
        s.vy = -Math.abs(s.vy);
      }

      if (mouse.active) {
        var cx = s.x + s.w / 2;
        var cy = s.y + s.h / 2;
        var dx = cx - mouse.x;
        var dy = cy - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_RADIUS && dist > 0.01) {
          var force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
          s.vx += (dx / dist) * force;
          s.vy += (dy / dist) * force;
        }
      }

      var speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
      if (speed > MAX_SPEED) {
        s.vx = (s.vx / speed) * MAX_SPEED;
        s.vy = (s.vy / speed) * MAX_SPEED;
      }

      s.phase += 0.02;
      var wobble = Math.sin(s.phase * 1.4 + i) * 6;
      var scale = 1 + Math.sin(s.phase + i) * 0.05;

      icon.style.transform =
        "translate(" + s.x.toFixed(1) + "px, " + s.y.toFixed(1) + "px) rotate(" + wobble.toFixed(1) + "deg) scale(" + scale.toFixed(2) + ")";
    });

    requestAnimationFrame(tick);
  }

  if (reducedMotion) {
    icons.forEach(function (icon, i) {
      var s = state[i];
      icon.style.transform = "translate(" + s.x + "px, " + s.y + "px)";
    });
  } else {
    requestAnimationFrame(tick);
  }
})();
