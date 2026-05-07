const slides = Array.from(document.querySelectorAll(".slide"));
const prevButton = document.getElementById("prevSlide");
const nextButton = document.getElementById("nextSlide");
const counter = document.getElementById("slideCounter");
const progressBar = document.getElementById("progressBar");
const deck = document.getElementById("current-slide");
let animeTools = null;

let current = Number.parseInt(window.location.hash.replace("#", ""), 10) - 1;
if (!Number.isInteger(current) || current < 0 || current >= slides.length) current = 0;

function render() {
  slides.forEach((slide, index) => {
    slide.classList.toggle("active", index === current);
    slide.setAttribute("aria-hidden", index === current ? "false" : "true");
  });

  counter.textContent = `${current + 1} / ${slides.length}`;
  prevButton.disabled = current === 0;
  nextButton.disabled = current === slides.length - 1;
  progressBar.style.width = `${((current + 1) / slides.length) * 100}%`;
  window.history.replaceState(null, "", `#${current + 1}`);
  animateCurrentSlide();
}

function animateCurrentSlide() {
  const slide = slides[current];
  const animatedItems = slide.querySelectorAll("[data-animate]");

  if (!animeTools) {
    animatedItems.forEach((item) => item.classList.add("fallbackVisible"));
    return;
  }

  const { animate, stagger } = animeTools;

  animate(animatedItems, {
    opacity: [0, 1],
    translateY: [28, 0],
    scale: [0.985, 1],
    delay: stagger(70),
    duration: 680,
    ease: "outExpo",
  });

  const wires = slide.querySelectorAll(".wire");
  if (wires.length > 0) {
    animate(wires, {
      scaleX: [0, 1],
      transformOrigin: "left center",
      delay: stagger(120),
      duration: 720,
      ease: "inOutQuad",
    });
  }
}

function goTo(index) {
  current = Math.max(0, Math.min(slides.length - 1, index));
  render();
  deck.focus({ preventScroll: true });
}

prevButton.addEventListener("click", () => goTo(current - 1));
nextButton.addEventListener("click", () => goTo(current + 1));

window.addEventListener("keydown", (event) => {
  if (["ArrowRight", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    goTo(current + 1);
  }

  if (["ArrowLeft", "PageUp"].includes(event.key)) {
    event.preventDefault();
    goTo(current - 1);
  }

  if (event.key === "Home") goTo(0);
  if (event.key === "End") goTo(slides.length - 1);
});

render();

import("https://esm.sh/animejs@4.2.2")
  .then((tools) => {
    animeTools = tools;
    slides[current].querySelectorAll("[data-animate]").forEach((item) => item.classList.remove("fallbackVisible"));
    animateCurrentSlide();
  })
  .catch(() => {});
