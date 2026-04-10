/* ============================================================
   ui.js -- Sidebar scroll-spy and mobile toggle
   Highlights the sidebar link matching the section in view.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── SCROLL SPY ──────────────────────────────────── */
  const sections = document.querySelectorAll('.section[id]');
  const navLinks = document.querySelectorAll('.sidebar-nav a');

  let isScrollingProgrammatically = false;
  let scrollTimer = null;

  function setActive(id) {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + id);
    });
  }

  if (sections.length && navLinks.length) {
    const observer = new IntersectionObserver(entries => {
      // Ignore all observer callbacks fired during a programmatic scroll
      if (isScrollingProgrammatically) return;
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    }, {
      rootMargin: '0px 0px -60% 0px',
      threshold: 0
    });

    sections.forEach(s => observer.observe(s));
  }

  /* ── MOBILE TOGGLE ───────────────────────────────── */
  const toggle  = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');

  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });

    sidebar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
      });
    });

    document.addEventListener('click', e => {
      if (sidebar.classList.contains('mobile-open') &&
          !sidebar.contains(e.target) &&
          e.target !== toggle) {
        sidebar.classList.remove('mobile-open');
      }
    });
  }

  /* ── SMOOTH SCROLL ───────────────────────────────── */
  document.querySelectorAll('.sidebar-nav a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      // Immediately highlight the clicked link, suppress observer until scroll settles
      setActive(targetId);
      isScrollingProgrammatically = true;
      clearTimeout(scrollTimer);

      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Re-enable observer after scroll animation finishes (~600ms is enough for most distances)
      scrollTimer = setTimeout(() => {
        isScrollingProgrammatically = false;
      }, 700);
    });
  });

});