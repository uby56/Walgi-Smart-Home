const cards = document.querySelectorAll('.card');
let angleStep = Math.PI / (cards.length - 1);
let radius = 220;
let activeIndex = 2;

function updateCarousel() {
  cards.forEach((card, i) => {
    let offset = i - activeIndex;

    let angle = offset * angleStep + Math.PI / 2;

    let x = radius * Math.cos(angle);
    let y = radius * Math.sin(angle);

    // 🔥 rotation based on position
    let rotate = offset * 25; // key for angled look

    card.style.transform = `
      translate(${x}px, ${-y}px)
      rotate(${rotate}deg)
      scale(${i === activeIndex ? 1.2 : 0.85})
    `;

    card.style.opacity = Math.abs(offset) > 2 ? 0 : 1;
    card.style.zIndex = 100 - Math.abs(offset);
  });
}

cards.forEach((card, i) => {
  card.addEventListener('click', () => {
    activeIndex = i;
    updateCarousel();
  });
});

updateCarousel();