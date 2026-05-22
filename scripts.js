/* ==========================================================================
   Jawad Azeem — Portfolio Scripts
   Particle canvas, scroll animations, music player, typing effect
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ====================================================================
     1. PARTICLE CANVAS (Hero Background)
     ==================================================================== */
  const canvas = document.getElementById("hero-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    let mouse = { x: null, y: null };
    let width, height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resizeCanvas() {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }

    function createParticles() {
      const count = Math.min(70, Math.floor((width * height) / 18000));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 2 + 0.8,
          opacity: Math.random() * 0.3 + 0.15,
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(201, 85, 45, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw and update particles
      for (const p of particles) {
        // Mouse interaction
        if (mouse.x !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            const force = (160 - dist) / 160;
            p.vx += (dx / dist) * force * 0.015;
            p.vy += (dy / dist) * force * 0.015;
          }
        }

        // Dampen velocity
        p.vx *= 0.998;
        p.vy *= 0.998;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 85, 45, ${p.opacity})`;
        ctx.fill();
      }

      requestAnimationFrame(drawParticles);
    }

    resizeCanvas();
    createParticles();
    drawParticles();

    window.addEventListener("resize", () => {
      resizeCanvas();
      createParticles();
    });

    canvas.parentElement.addEventListener("mousemove", (e) => {
      const rect = canvas.parentElement.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    canvas.parentElement.addEventListener("mouseleave", () => {
      mouse.x = null;
      mouse.y = null;
    });
  }

  /* ====================================================================
     2. TYPING EFFECT
     ==================================================================== */
  const typedEl = document.getElementById("typed-title");
  if (typedEl) {
    const titles = [
      "Software Engineer",
      "Cloud Architect",
      "Backend Developer",
      "System Builder",
    ];
    let titleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let speed = 80;

    function type() {
      const current = titles[titleIdx];

      if (isDeleting) {
        typedEl.textContent = current.substring(0, charIdx - 1);
        charIdx--;
        speed = 40;
      } else {
        typedEl.textContent = current.substring(0, charIdx + 1);
        charIdx++;
        speed = 80;
      }

      if (!isDeleting && charIdx === current.length) {
        speed = 2200;
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        titleIdx = (titleIdx + 1) % titles.length;
        speed = 400;
      }

      setTimeout(type, speed);
    }

    setTimeout(type, 600);
  }

  /* ====================================================================
     3. NAVBAR (Scroll behavior)
     ==================================================================== */
  const navbar = document.getElementById("navbar");
  const heroSection = document.getElementById("hero");
  let lastScroll = 0;

  if (navbar && heroSection) {
    function handleNavScroll() {
      const scrollY = window.scrollY;
      const heroBottom = heroSection.offsetHeight - 100;

      if (scrollY > heroBottom) {
        navbar.classList.add("visible", "scrolled");

        // Hide on scroll down, show on scroll up
        if (scrollY > lastScroll && scrollY > heroBottom + 200) {
          navbar.style.transform = "translateY(-100%)";
        } else {
          navbar.style.transform = "translateY(0)";
        }
      } else {
        navbar.classList.remove("visible", "scrolled");
      }

      lastScroll = scrollY;
    }

    window.addEventListener("scroll", handleNavScroll, { passive: true });
  }

  // Mobile nav toggle
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("active");
      navLinks.classList.toggle("open");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navToggle.classList.remove("active");
        navLinks.classList.remove("open");
      });
    });
  }

  /* ====================================================================
     4. SMOOTH SCROLL
     ==================================================================== */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        const offset = navbar ? 72 : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });

  /* ====================================================================
     5. SCROLL ANIMATIONS (Intersection Observer)
     ==================================================================== */
  const animatedElements = document.querySelectorAll("[data-animate]");
  if (animatedElements.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay || 0;
            setTimeout(() => {
              entry.target.classList.add("visible");
            }, parseInt(delay));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    animatedElements.forEach((el) => observer.observe(el));
  }

  /* ====================================================================
     6. PROJECT CARD TILT EFFECT
     ==================================================================== */
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -3;
      const rotateY = ((x - centerX) / centerX) * 3;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform =
        "perspective(800px) rotateX(0) rotateY(0) translateY(0)";
      card.style.transition = "transform 0.4s ease";
      setTimeout(() => {
        card.style.transition = "";
      }, 400);
    });
  });

  /* ====================================================================
     7. MUSIC PLAYER
     ==================================================================== */
  const musicFab = document.getElementById("music-fab");
  const musicPanel = document.getElementById("music-panel");
  const musicPanelClose = document.getElementById("music-panel-close");
  const dropZone = document.getElementById("drop-zone");
  const playerUI = document.getElementById("player-ui");
  const playBtn = document.getElementById("play-btn");
  const progressBar = document.getElementById("progress-bar");
  const progressFill = document.getElementById("progress-fill");
  const timeCurrent = document.getElementById("time-current");
  const timeTotal = document.getElementById("time-total");
  const songNameEl = document.getElementById("song-name");
  const visualizerCanvas = document.getElementById("visualizer");
  const fileInput = document.getElementById("audio-file-input");
  const iconPlay = document.getElementById("icon-play");
  const iconPause = document.getElementById("icon-pause");

  // FAB toggle
  if (musicFab && musicPanel) {
    musicFab.addEventListener("click", () => {
      musicPanel.classList.toggle("open");
    });

    if (musicPanelClose) {
      musicPanelClose.addEventListener("click", () => {
        musicPanel.classList.remove("open");
      });
    }
  }

  if (dropZone && playerUI) {
    const audio = new Audio();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let audioContext = null;
    let analyser = null;
    let sourceNode = null;
    let isPlaying = false;
    let visualizerCtx = visualizerCanvas ? visualizerCanvas.getContext("2d") : null;

    function formatTime(s) {
      if (isNaN(s)) return "0:00";
      const mins = Math.floor(s / 60);
      const secs = Math.floor(s % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    function loadAudioFile(file) {
      if (!file || !file.type.startsWith("audio/")) return;

      const url = URL.createObjectURL(file);
      audio.src = url;
      songNameEl.textContent = file.name.replace(/\.[^/.]+$/, "");

      dropZone.style.display = "none";
      playerUI.classList.add("active");

      // Resize visualizer canvas
      if (visualizerCanvas) {
        visualizerCanvas.width = visualizerCanvas.offsetWidth * dpr;
        visualizerCanvas.height = visualizerCanvas.offsetHeight * dpr;
        visualizerCtx.scale(dpr, dpr);
      }

      setupAudioContext();
      play();
    }

    function setupAudioContext() {
      if (audioContext) return;
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      sourceNode = audioContext.createMediaElementSource(audio);
      sourceNode.connect(analyser);
      analyser.connect(audioContext.destination);
      drawVisualizer();
    }

    function drawVisualizer() {
      if (!analyser || !visualizerCanvas || !visualizerCtx) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const w = visualizerCanvas.offsetWidth;
      const h = visualizerCanvas.offsetHeight;

      function draw() {
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        visualizerCtx.clearRect(0, 0, w, h);

        const barCount = Math.min(64, bufferLength);
        const barW = w / barCount;
        const step = Math.floor(bufferLength / barCount);

        for (let i = 0; i < barCount; i++) {
          const val = dataArray[i * step];
          const barH = (val / 255) * h * 0.85;
          const hue = (i / barCount) * 25 + 15;
          const alpha = isPlaying ? 0.7 : 0.15;

          visualizerCtx.fillStyle = `hsla(${hue}, 75%, 50%, ${alpha})`;

          // Rounded bars
          const x = i * barW + 1;
          const y = h - barH;
          const bw = Math.max(barW - 2, 1);
          const r = Math.min(bw / 2, 3);
          visualizerCtx.beginPath();
          visualizerCtx.moveTo(x + r, y);
          visualizerCtx.lineTo(x + bw - r, y);
          visualizerCtx.quadraticCurveTo(x + bw, y, x + bw, y + r);
          visualizerCtx.lineTo(x + bw, h);
          visualizerCtx.lineTo(x, h);
          visualizerCtx.lineTo(x, y + r);
          visualizerCtx.quadraticCurveTo(x, y, x + r, y);
          visualizerCtx.fill();
        }
      }
      draw();
    }

    function play() {
      audio.play();
      if (audioContext && audioContext.state === "suspended") {
        audioContext.resume();
      }
      isPlaying = true;
      if (iconPlay) iconPlay.style.display = "none";
      if (iconPause) iconPause.style.display = "block";
      if (musicFab) musicFab.classList.add("playing");
    }

    function pause() {
      audio.pause();
      isPlaying = false;
      if (iconPlay) iconPlay.style.display = "block";
      if (iconPause) iconPause.style.display = "none";
      if (musicFab) musicFab.classList.remove("playing");
    }

    // Events
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("drag-over");
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("drag-over");
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("drag-over");
      const file = e.dataTransfer.files[0];
      loadAudioFile(file);
    });

    dropZone.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) loadAudioFile(file);
    });

    playBtn.addEventListener("click", () => {
      if (isPlaying) pause();
      else play();
    });

    audio.addEventListener("timeupdate", () => {
      if (audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = pct + "%";
        timeCurrent.textContent = formatTime(audio.currentTime);
      }
    });

    audio.addEventListener("loadedmetadata", () => {
      timeTotal.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("ended", () => {
      pause();
      audio.currentTime = 0;
      progressFill.style.width = "0%";
    });

    progressBar.addEventListener("click", (e) => {
      const rect = progressBar.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    });
  }

  /* ====================================================================
     8. ASK JAWAD
     ==================================================================== */
  const askBtn = document.getElementById("ask-btn");
  const askInput = document.getElementById("ask-input");
  const askStatus = document.getElementById("ask-status");
  const askResponse = document.getElementById("ask-response");

  if (askBtn && askInput && askStatus && askResponse) {
    askBtn.addEventListener("click", async () => {
      const question = askInput.value.trim();
      if (!question) {
        askStatus.textContent = "Please enter a question.";
        return;
      }

      askStatus.textContent = "Thinking...";
      askResponse.classList.remove("visible");
      askResponse.textContent = "";

      try {
        const res = await fetch("/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: question }),
        });
        const data = await res.json();
        askResponse.textContent = data.reply;
        askResponse.classList.add("visible");
        askStatus.textContent = "";
      } catch {
        askStatus.textContent = "AI service unavailable. Run the server locally to use this feature.";
      }
    });

    // Allow Enter key to submit (Shift+Enter for newline)
    askInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        askBtn.click();
      }
    });
  }

  /* ====================================================================
     9. JAVA -> JAWAD EASTER EGG
     ==================================================================== */
  const classNameEl = document.getElementById("class-name");
  if (classNameEl) {
    const eggObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Wait, then morph "Java" into "Jawad"
            setTimeout(() => {
              classNameEl.style.transition = "color 0.3s ease";
              classNameEl.style.color = "#f9e2af";

              setTimeout(() => {
                classNameEl.textContent = "Jawad";
                setTimeout(() => {
                  classNameEl.style.color = "";
                }, 400);
              }, 300);
            }, 1800);

            eggObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    eggObserver.observe(classNameEl.closest(".code-window"));
  }

  /* ====================================================================
     10. ACTIVE NAV LINK HIGHLIGHT
     ==================================================================== */
  const sections = document.querySelectorAll("section[id]");
  if (sections.length && navbar) {
    const navItems = navbar.querySelectorAll(".nav-links a");

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navItems.forEach((link) => {
              link.classList.toggle(
                "active",
                link.getAttribute("href") === `#${id}`
              );
            });
          }
        });
      },
      { threshold: 0.3, rootMargin: "-80px 0px -40% 0px" }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }
});
