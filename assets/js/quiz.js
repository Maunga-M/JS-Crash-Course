/* ============================================================
   quiz.js -- Quiz engine
   Handles: option selection, validation, scoring, reset
   Usage: define window.quizConfig on each module page
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.quizConfig) return;

  const cfg = window.quizConfig;
  const totalQs = cfg.questions.length;
  const qNums = cfg.questions.map(q => q.id);

  /* ── OPTION CLICK ──────────────────────────────── */
  document.querySelectorAll('.q-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const q = opt.dataset.q;
      document.querySelectorAll(`[data-q="${q}"]`).forEach(o => {
        o.classList.remove('selected', 'unanswered-warn');
      });
      opt.classList.add('selected');
      opt.querySelector('input').checked = true;
    });
  });

  /* ── SUBMIT ────────────────────────────────────── */
  function submitQuiz() {
    const errEl = document.getElementById('quizError');

    // Validate all answered
    const unanswered = qNums.filter(q => !document.querySelector(`[data-q="${q}"].selected`));
    if (unanswered.length > 0) {
      unanswered.forEach(q => {
        document.querySelectorAll(`[data-q="${q}"]`).forEach(o => o.classList.add('unanswered-warn'));
      });
      errEl.className = 'quiz-error show';
      return;
    }
    errEl.className = 'quiz-error';

    let score = 0;
    cfg.questions.forEach(q => {
      const sel = document.querySelector(`[data-q="${q.id}"].selected`);
      const fb  = document.getElementById('fb' + q.id);
      const ok  = sel.dataset.val === q.answer;
      if (ok) {
        sel.classList.add('correct');
        fb.classList.add('correct-fb');
        fb.innerHTML = q.feedback.correct;
        score++;
      } else {
        sel.classList.add('incorrect');
        fb.classList.add('incorrect-fb');
        fb.innerHTML = q.feedback.wrong;
        const correctOpt = document.querySelector(`[data-q="${q.id}"][data-val="${q.answer}"]`);
        if (correctOpt) correctOpt.classList.add('correct');
      }
      fb.classList.add('show');
    });

    document.getElementById('resultScore').textContent = `${score} / ${totalQs}`;
    document.getElementById('resultMsg').textContent =
      score === totalQs       ? cfg.messages.perfect :
      score >= totalQs * 0.66 ? cfg.messages.good :
                                 cfg.messages.retry;
    document.getElementById('quizResult').classList.add('show');
    document.getElementById('submitQuiz').textContent = 'Retake Quiz';
    document.getElementById('submitQuiz').onclick = resetQuiz;
  }

  /* ── RESET ─────────────────────────────────────── */
  function resetQuiz() {
    qNums.forEach(q => {
      document.querySelectorAll(`[data-q="${q}"]`).forEach(o => {
        o.classList.remove('selected','correct','incorrect','unanswered-warn');
        const inp = o.querySelector('input');
        if (inp) inp.checked = false;
      });
      const fb = document.getElementById('fb' + q);
      if (fb) { fb.className = 'q-feedback'; fb.innerHTML = ''; }
    });
    document.getElementById('quizResult').className = 'quiz-result';
    document.getElementById('quizError').className = 'quiz-error';
    document.getElementById('submitQuiz').textContent = 'Submit Answers';
    document.getElementById('submitQuiz').onclick = submitQuiz;
  }

  document.getElementById('submitQuiz').onclick = submitQuiz;
});