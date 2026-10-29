// Divisa&Go — movimiento de la web. Todo es opcional: sin JS o con "reducir movimiento" la página se ve completa.
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  // ---- Barra de progreso y sombra de la navegación ----
  const progress = document.createElement("div");
  progress.className = "progress";
  document.body.prepend(progress);
  const nav = document.querySelector("nav");

  // ---- Retardos escalonados: cada bloque y cada elemento de lista entra un poco después ----
  for (const parent of new Set($$(".reveal").map((element) => element.parentElement))) {
    $$(":scope > .reveal", parent).forEach((element, index) => element.style.setProperty("--d", index));
  }
  for (const list of $$(".steps, .sources, .chips, .trio, .plans, .themes")) {
    [...list.children].forEach((child, index) => child.style.setProperty("--i", index));
  }

  // ---- Entrada al hacer scroll ----
  const reveals = $$(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach((element) => element.classList.add("in"));
  } else {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("in");
        $$("[data-count]", entry.target).forEach(countUp);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach((element) => observer.observe(element));
  }

  // ---- Cifras que cuentan hasta su valor ----
  function countUp(element) {
    if (element.dataset.done) return;
    element.dataset.done = "1";
    const target = Number(element.dataset.count);
    if (reduce || !Number.isFinite(target)) return;
    const start = performance.now();
    const duration = 1300;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      element.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 4))));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  $$(".hero [data-count]").forEach((element) => setTimeout(() => countUp(element), 700));

  // ---- Scroll: progreso, nav, sección activa y parallax suave ----
  const links = $$("nav a.link").filter((link) => link.hash && document.querySelector(link.hash));
  const sections = links.map((link) => document.querySelector(link.hash));
  const parallax = reduce ? [] : $$(".split .frame, .themes figure .frame");
  let ticking = false;
  function onScroll() {
    ticking = false;
    const max = root.scrollHeight - innerHeight;
    progress.style.setProperty("--p", max > 0 ? String(Math.min(1, scrollY / max)) : "0");
    nav?.classList.toggle("scrolled", scrollY > 8);
    const mark = scrollY + innerHeight * 0.35;
    let active = -1;
    sections.forEach((section, index) => { if (section.offsetTop <= mark) active = index; });
    links.forEach((link, index) => link.classList.toggle("active", index === active));
    for (const frame of parallax) {
      const rect = frame.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > innerHeight + 200) continue;
      const offset = (rect.top + rect.height / 2 - innerHeight / 2) / innerHeight;
      frame.style.setProperty("--py", (offset * -26).toFixed(1));
    }
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", onScroll, { passive: true });
  onScroll();

  // ---- Inclinación 3D de las capturas del inicio según el puntero ----
  const stack = document.querySelector(".stack");
  if (stack && !reduce && matchMedia("(hover: hover)").matches) {
    const hero = stack.closest(".hero") || stack;
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      stack.style.setProperty("--ry", `${(x * 7).toFixed(2)}deg`);
      stack.style.setProperty("--rx", `${(-y * 5).toFixed(2)}deg`);
    });
    hero.addEventListener("pointerleave", () => {
      stack.style.setProperty("--ry", "0deg");
      stack.style.setProperty("--rx", "0deg");
    });
  }
})();
