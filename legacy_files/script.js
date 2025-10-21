// Mobile nav toggle (optional)
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
if(navToggle){
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });
}

// Replace thumbnail with video iframe on play
document.querySelectorAll('.video-card').forEach(card => {
  const btn = card.querySelector('.play-btn');
  const thumb = card.querySelector('.video-thumb');
  const src = card.getAttribute('data-video');
  if(btn){
    btn.addEventListener('click', () => {
      thumb.innerHTML = `<iframe width="100%" height="315" src="${src}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    });
  }
});
