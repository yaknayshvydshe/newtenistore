"use strict";

const wrapper = document.querySelector(".wrapper");
const wrapperHeight = wrapper.getBoundingClientRect().height;
const overlay = document.querySelector(".overlay");
const typingEffect = document.querySelector(".title");

///////////////////////////////////////
// Mobile navbar
document.querySelector('.btn').onclick = function (x) {
  var menu = document.querySelector('.menu');
  var btn = document.querySelector('.btn');

  menu.classList.toggle('is-active');
  btn.classList.toggle('is-active');

  x.preventDefault();
}

///////////////////////////////////////
// Sticky nav
const stickyNav = function (entries) {
  const [entry] = entries;

  if (!entry.isIntersecting) wrapper.classList.add("sticky");
  else wrapper.classList.remove("sticky");
};

const aboutObserver = new IntersectionObserver(stickyNav, {
  root: null,
  threshold: 0,
  rootMargin: `-${wrapperHeight}px`,
});

aboutObserver.observe(about);

///////////////////////////////////////
// Reveal sections
const allSections = document.querySelectorAll(".section");

const revealSection = function (entries, observer) {
  const [entry] = entries;

  if (!entry.isIntersecting) return;

  entry.target.classList.remove("section");
  observer.unobserve(entry.target);
};

const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.15,
});

allSections.forEach(function (section) {
  sectionObserver.observe(section);
  section.classList.add("section--hidden");
});

/////////////////////////////////////
// Smooth
const sr = ScrollReveal({
  origin: 'top',
  distance: '60px',
  duration: 2500,
  delay: 100,
})

sr.reveal(`.about`, {delay: 50})
sr.reveal(`.article`, {delay: 150})
sr.reveal(`.small-container`, {delay: 500})
sr.reveal(`.row`, {delay: 800})
sr.reveal(`.footer`, {delay: 1000})

/////////////////////////////////////
// Interactive pointer
document.body.addEventListener("pointermove", (e)=>{
  const { currentTarget: el, clientX: x, clientY: y } = e;
  const { top: t, left: l, width: w, height: h } = el.getBoundingClientRect();
  el.style.setProperty('--posX',  x-l-w/2);
  el.style.setProperty('--posY',  y-t-h/2);
})