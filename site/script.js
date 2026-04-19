const revealElements = document.querySelectorAll('.reveal');
const form = document.querySelector('#contact-form');
const yearSlot = document.querySelector('[data-year]');

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.16 }
);

revealElements.forEach((element) => observer.observe(element));

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const name = (data.get('name') || 'Visitor').toString().trim() || 'Visitor';
    const message = (data.get('message') || '').toString().trim() || 'I would like to discuss the landing page.';

    const subject = encodeURIComponent(`Inquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\nSent from the Job of the Day Worldwide presentation page.`);
    const mailto = `mailto:seevov@proton.me?subject=${subject}&body=${body}`;

    window.location.href = mailto;
  });
}

if (yearSlot) {
  yearSlot.textContent = new Date().getFullYear();
}
