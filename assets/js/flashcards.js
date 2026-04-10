/* ============================================================
   flashcards.js -- Flashcard flip logic
   Cards flip on click. Add class="flashcard" to wrapper.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.flashcard').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
  });
});