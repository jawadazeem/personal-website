// Toggle mobile navigation menu
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    const visible = navLinks.style.display === 'flex';
    navLinks.style.display = visible ? 'none' : 'flex';
  });
}

// Smooth scrolling for internal navigation
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const targetId = link.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);

    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Close mobile menu after clicking a link
      if (window.innerWidth < 900) {
        navLinks.style.display = 'none';
      }
    }
  });
});

// Experience section tab functionality
const tabs = document.querySelectorAll(".experience-list li");
  const panels = document.querySelectorAll(".experience-panel");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(tab.dataset.exp).classList.add("active");
    });
  });

// Contact form placeholder behavior (client-side only)
const form = document.getElementById('contactForm');

if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();

    alert('Thank you! Your message has been received locally.\n\nTo enable sending emails, connect this form to AWS SES, Formspree, or Netlify Forms.');
    form.reset();
  });
}

/* --- AskJawad Real AI Logic --- */
document.addEventListener("DOMContentLoaded", () => {

  const askBtn = document.getElementById("ask-btn");
  const input = document.getElementById("ask-input");
  const status = document.getElementById("ask-status");
  const responseBox = document.getElementById("ask-response");

  if (!askBtn || !input || !status || !responseBox) {
    console.error("AskJawad elements missing in DOM");
    return;
  }
  

  askBtn.addEventListener("click", async () => {

    const question = input.value.trim();

    if (!question) {
      status.textContent = "Ready when you are.";
      return;
    }

    status.textContent = "Thinking...";
    responseBox.textContent = "";

    try {

      const res = await fetch("http://localhost:3000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: question })
      });

      const data = await res.json();

      responseBox.textContent = data.reply;
      status.textContent = "";

    } catch (err) {

      console.error(err);
      status.textContent = "AI service unavailable.";

    }

  });

});



