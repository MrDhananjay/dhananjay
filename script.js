// Initialize Lenis once for smooth scrolling
const lenis = new Lenis({
  smooth: true,
  duration: 1.2,
  easing: (t) => 1 - Math.pow(1 - t, 3),
});

// Single RAF loop for both Lenis and GSAP
function raf(time) {
  lenis.raf(time);
  ScrollTrigger.update();
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Initialize GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);
gsap.ticker.lagSmoothing(0);

// Text scramble class
class TextScramble {
constructor(el) {
  this.el = el;
  this.chars = '!<>-_\\/[]{}—=+*^?#________';
  this.originalText = el.innerText;
  this.update = this.update.bind(this);
}

setText(newText) {
  const oldText = this.el.innerText || '';
  const length = Math.max(oldText.length, newText.length);
  const promise = new Promise((resolve) => (this.resolve = resolve));
  this.queue = [];

  for (let i = 0; i < length; i++) {
    const from = oldText[i] || '';
    const to = newText[i] || '';
    const start = Math.floor(Math.random() * 40);
    const end = start + Math.floor(Math.random() * 40);
    this.queue.push({ from, to, start, end });
  }

  cancelAnimationFrame(this.frameRequest);
  this.frame = 0;
  this.el.style.opacity = 1; // Make sure it's visible when animation starts
  this.update();
  return promise;
}

update() {
  let output = '';
  let complete = 0;

  for (let i = 0, n = this.queue.length; i < n; i++) {
    let { from, to, start, end, char } = this.queue[i];
    if (this.frame >= end) {
      complete++;
      output += to;
    } else if (this.frame >= start) {
      if (!char || Math.random() < 0.28) {
        char = this.randomChar();
        this.queue[i].char = char;
      }
      output += char;
    } else {
      output += from;
    }
  }

  this.el.innerText = output;

  if (complete === this.queue.length) {
    this.resolve();
  } else {
    this.frameRequest = requestAnimationFrame(this.update);
    this.frame++;
  }
}

randomChar() {
  return this.chars[Math.floor(Math.random() * this.chars.length)];
}
}

// Consolidated initialization function for all animations and interactions
document.addEventListener('DOMContentLoaded', () => {
// ===== SECTION 1: Main UI Setup and Video Handler =====

// Animate hero letters
gsap.from('.letter-container', {
  opacity: 0,
  y: 100,
  rotateX: -90,
  stagger: 0.1,
  duration: 1,
  delay: 3,
  ease: 'power3.out'
});

// Get all SVG paths and set dash values
document.querySelectorAll('.hero_letter-path').forEach(path => {
  const length = path.getTotalLength();
  path.style.strokeDasharray = length;
  path.style.strokeDashoffset = length;
});

// Setup video unmute button
const video = document.querySelector('.video-container video');
if (video) {
  const unmuteButton = document.createElement('button');
  unmuteButton.innerHTML = 'Unmute';
  unmuteButton.classList.add('unmute-btn');
  document.querySelector('.video-container').appendChild(unmuteButton);
  
  unmuteButton.addEventListener('click', () => {
    video.muted = !video.muted;
    unmuteButton.innerHTML = video.muted ? 'Unmute' : 'Mute';
  });
}

// ===== SECTION 2: Text Animation Configuration =====

// Text elements configuration for main animation
const mainTextElements = {
  name: {
    element: document.querySelector('.name-text'),
    text: 'Dhananjay Singh',
  },
  profession: {
    element: document.querySelector('.profession-text'),
    text: 'Product Manager',
  },
  description: {
    element: document.querySelector('.description-text'),
    text: 'FullStack Developer',
  },
  freelance: {
    element: document.querySelector('.freelance-text'),
    text: 'Freelance Developer',
  },
  scrolldown: {
    element: document.querySelector('.scrolldown-text'),
    text: 'Scroll Down',
  },
};

// Initialize TextScramble instances for main animation
const mainFxInstances = {};
Object.entries(mainTextElements).forEach(([key, { element, text }]) => {
  if (element) {
    element.innerText = ''; // Ensure text is empty at start
    element.style.opacity = 0;
    const fx = new TextScramble(element);
    fx.originalText = text;
    mainFxInstances[key] = fx;
  }
});

// Navigation elements with their original text
const navElements = {
  menuBtn: {
    element: document.querySelector('#menuBtn'),
    text: 'MENU'
  },
  homeBtn: {
    element: document.querySelector('#homeBtn'),
    text: 'HOME'
  },
  casesBtn: {
    element: document.querySelector('#casesBtn'),
    text: 'CASES'
  },
  contactsBtn: {
    element: document.querySelector('#contactsBtn'),
    text: 'CONTACTS'
  }
};

// Create separate map to track scrambling state for each nav button
const isScrambling = {};

// Add hover effect to all nav buttons
Object.entries(navElements).forEach(([id, {element, text}]) => {
  if (element) {
    isScrambling[id] = false;
    const fx = new TextScramble(element);
    fx.originalText = text;
    
    // Make sure the original text is set
    element.innerText = text;
    
    element.addEventListener('mouseenter', () => {
      if (!isScrambling[id]) {
        isScrambling[id] = true;
        fx.setText(text).then(() => {
          isScrambling[id] = false;
        });
      }
    });
  }
});

// ===== SECTION 3: Menu Button and Navigation =====

const menuBtn = document.getElementById('menuBtn');
if (menuBtn) {
  const navLinks = document.getElementById('navLinks');
  const navLinksItems = document.querySelectorAll('.nav-link');

  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
    navLinksItems.forEach(link => {
      link.style.opacity = navLinks.classList.contains('active') ? '1' : '0';
    });
  });

  // Close menu when clicking outside (use event delegation)
  document.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('active')) {
      menuBtn.classList.remove('active');
      navLinks.classList.remove('active');
      navLinksItems.forEach(link => {
        link.style.opacity = '0';
      });
    }
  });
}

// ===== SECTION 4: Text Animation Sequence =====

// Animation sequence control for main texts
const animationOrder = ['name', 'profession', 'description', 'freelance', 'scrolldown'];

async function runSequentialAnimation() {
  while (true) {
    for (const key of animationOrder) {
      const fx = mainFxInstances[key];
      if (!fx) continue;

      // Animate text in
      await fx.setText(fx.originalText);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Display duration
      
      // Animate text out
      await fx.setText('');
      await new Promise((resolve) => setTimeout(resolve, 250)); // Pause between elements
    }
  }
}

// Start the animation sequence
runSequentialAnimation();

// ===== SECTION 5: Sticky Scroll Physics Animation =====

// Matter.js physics setup
const { Engine, Runner, World, Bodies, Body, Events } = Matter;
const engine = Engine.create({
  gravity: { x: 0, y: 0 },
});
const runner = Runner.create();
Runner.run(runner, engine);

// Add floor for physics
const floor = Bodies.rectangle(
  window.innerWidth / 2,
  window.innerHeight + 5,
  window.innerWidth,
  20,
  { isStatic: true }
);
World.add(engine.world, floor);

// Setup text highlighting and physics
const highlightWords = [
  "Dhananjay", "Engineer", "University", "simulation", "Artificial",
  "Intelligence", "exploring", "journey", "PRO", "creativity", "life",
];

// Split text for animation
const text = new SplitType(".sticky p", { types: "words" });
const words = [...text.words];

// Shuffle words for random animations
const shuffledWords = [...words];
for (let i = shuffledWords.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
}

const wordsToHighlight = words.filter((word) =>
  highlightWords.some((highlight) => word.textContent.includes(highlight))
);

let physicsEnabled = false;
let lastProgress = 0;
const charElements = [];
const charBodies = [];

// Modified character positioning in JavaScript
wordsToHighlight.forEach((word) => {
  const chars = word.textContent.split("");
  const wordRect = word.getBoundingClientRect();
  const stickyRect = document.querySelector(".sticky").getBoundingClientRect();

  word.style.opacity = 1;

  chars.forEach((char, charIndex) => {
    const charSpan = document.createElement("span");
    charSpan.className = "char";
    charSpan.textContent = char;
    charSpan.style.position = "absolute";
    document.querySelector(".sticky").appendChild(charSpan);

    // Calculate position while maintaining full width alignment
    const charWidth = word.offsetWidth / chars.length;
    // Maintain x position calculation relative to the container
    const x = wordRect.left - stickyRect.left + charIndex * charWidth;
    const y = wordRect.top - stickyRect.top;

    charSpan.style.left = `${x}px`;
    charSpan.style.top = `${y}px`;
    charSpan.style.color = getComputedStyle(word).color;
    charElements.push(charSpan);

    // Update body position for physics
    const body = Bodies.rectangle(
      x + charWidth / 2,
      y + charSpan.offsetHeight / 2,
      charWidth,
      charSpan.offsetHeight,
      {
        restitution: 0.75,
        friction: 0.5,
        frictionAir: 0.0175,
        isStatic: true,
      }
    );

    World.add(engine.world, body);
    charBodies.push({
      body,
      element: charSpan,
      initialX: x,
      initialY: y,
    });
  });
});

// Reset physics animation
function resetAnimation() {
  engine.world.gravity.y = 0;

  charBodies.forEach(({ body, element, initialX, initialY }) => {
    Body.setStatic(body, true);
    Body.setPosition(body, {
      x: initialX + element.offsetWidth / 2,
      y: initialY + element.offsetHeight / 2,
    });
    Body.setAngle(body, 0);
    Body.setVelocity(body, { x: 0, y: 0 });
    Body.setAngularVelocity(body, 0);

    element.style.transform = "none";
    element.style.opacity = 0;
  });

  words.forEach((word) => {
    gsap.to(word, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.in",
    });
  });
}

// Create ScrollTrigger for sticky section
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".sticky",
    start: "top top",
    end: `+=${window.innerHeight * 4}px`,
    pin: true,
    scrub: true,
    onUpdate: (self) => {
      const isScrollingDown = self.progress > lastProgress;
      lastProgress = self.progress;

      if (self.progress >= 0.6 && !physicsEnabled && isScrollingDown) {
        physicsEnabled = true;
        engine.world.gravity.y = 1;

        wordsToHighlight.forEach((word) => {
          word.style.opacity = 0;
        });

        charBodies.forEach(({ body, element }) => {
          element.style.opacity = 1;
          element.style.color = "#FFFFFF";
          Body.setStatic(body, false);
          Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.25);
          Body.setVelocity(body, {
            x: (Math.random() - 0.5) * 5,
            y: -Math.random() * 5,
          });
        });

        gsap.to(
          words.filter(word => !highlightWords.some(hw => word.textContent.includes(hw))),
          {
            opacity: 0,
            duration: 0.5,
            ease: "power2.out",
          }
        );
      } else if (self.progress < 0.6 && physicsEnabled && !isScrollingDown) {
        physicsEnabled = false;
        resetAnimation();
      }
    },
  },
});

// Create phase animations for timeline
const phase1 = gsap.timeline();
shuffledWords.forEach((word) => {
  phase1.to(
    word,
    {
      color: "#EB4330",
      duration: 0.1,
      ease: "power2.inOut",
    },
    Math.random() * 0.9
  );
});

const phase2 = gsap.timeline();
const shuffledHighlights = [...wordsToHighlight];
for (let i = shuffledHighlights.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [shuffledHighlights[i], shuffledHighlights[j]] = [
    shuffledHighlights[j],
    shuffledHighlights[i],
  ];
}

shuffledHighlights.forEach((word) => {
  phase2.to(
    word,
    {
      color: "#FFFFFF",
      duration: 0.1,
      ease: "power2.inOut",
    },
    Math.random() * 0.9
  );
});

tl.add(phase1, 0).add(phase2, 1).to({}, { duration: 2 });

// Update character positions based on physics
Events.on(engine, "afterUpdate", () => {
  if (physicsEnabled) {
    charBodies.forEach(({ body, element, initialX, initialY }) => {
      const deltaX = body.position.x - (initialX + element.offsetWidth / 2);
      const deltaY = body.position.y - (initialY + element.offsetHeight / 2);
      element.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${body.angle}rad)`;
    });
  }
});
});