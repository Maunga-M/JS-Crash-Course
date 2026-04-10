/* ============================================================
   editor.js -- Code editor engine
   Handles: run, check answer, tab support
   ============================================================ */

/* ── EXECUTE CODE ────────────────────────────────── */
function executeCode(code) {
  const logs = [], errors = [];
  const orig = console.log;
  console.log = function(...args) {
    logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    orig.apply(console, args);
  };
  try { new Function(code)(); }
  catch(e) { errors.push(e.message); }
  finally { console.log = orig; }

  let html = '';
  logs.forEach(l => { html += `<div class="output-line">${esc(l)}</div>`; });
  errors.forEach(e => { html += `<div class="output-error">Error: ${esc(e)}</div>`; });
  if (!logs.length && !errors.length) {
    html = '<div style="color:rgba(255,255,255,0.22);font-size:12px">No output. Use console.log() to see results.</div>';
  }
  return html;
}

/* ── RUN STATIC BLOCK ────────────────────────────── */
function runStatic(id) {
  const pre = document.getElementById(id + '-code');
  const out = document.getElementById(id + '-output');
  if (!pre || !out) return;
  // Strip any HTML tags (syntax spans) to get plain code text
  const code = pre.innerText;
  out.innerHTML = '<div class="output-label">Output</div>' + executeCode(code);
}

/* ── RESET STATIC BLOCK ──────────────────────────── */
function resetStatic(id) {
  const pre = document.getElementById(id + '-code');
  const out = document.getElementById(id + '-output');
  if (!pre) return;
  if (window.staticBlocksHTML && window.staticBlocksHTML[id]) {
    pre.innerHTML = window.staticBlocksHTML[id];
  }
  if (out) out.innerHTML = '<div class="output-label">Output</div>';
}

/* ── RESET EDITOR ────────────────────────────────── */
function resetEditor(editorId) {
  const textarea = document.getElementById(editorId + '-code');
  const output   = document.getElementById(editorId + '-output');
  const cfg = window.checkConfigs && Object.values(window.checkConfigs).find(c => c.editorId === editorId);
  if (textarea && window.editorDefaults && window.editorDefaults[editorId]) {
    textarea.value = window.editorDefaults[editorId];
  }
  if (output) output.innerHTML = '<div class="output-label">Output</div>';
  // Clear check result if present
  if (cfg) {
    const resultEl = document.getElementById(cfg.resultId);
    if (resultEl) { resultEl.className = 'check-result'; resultEl.innerHTML = ''; }
  }
}


function runCode(editorId) {
  const code = document.getElementById(editorId + '-code').value;
  const el = document.getElementById(editorId + '-output');
  el.innerHTML = '<div class="output-label">Output</div>' + executeCode(code);
}

/* ── CHECK ANSWER ────────────────────────────────── */
// checkConfig is defined per-module:
// window.checkConfig = {
//   editorId: 'editor1',
//   resultId: 'checkResult',
//   expected: ['line 1', 'line 2'],
//   successMsg: 'All correct. ...',
//   failMsg: 'Not yet. ...'
// }
function checkAnswer(configKey) {
  const cfg = window.checkConfigs && window.checkConfigs[configKey];
  if (!cfg) return;

  const code = document.getElementById(cfg.editorId + '-code').value;
  document.getElementById(cfg.editorId + '-output').innerHTML =
    '<div class="output-label">Output</div>' + executeCode(code);

  const logs = [];
  const orig = console.log;
  console.log = function(...args) { logs.push(args.map(a => String(a)).join(' ')); orig.apply(console, args); };
  try { new Function(code)(); } catch(e) {}
  finally { console.log = orig; }

  const matched = cfg.expected.filter(e => logs.some(l => l.trim() === e.trim()));
  const resultEl = document.getElementById(cfg.resultId);
  const total = cfg.expected.length;

  if (matched.length === total) {
    resultEl.className = 'check-result pass';
    resultEl.innerHTML = `<strong>All correct.</strong> ${cfg.successMsg}`;
  } else if (matched.length > 0) {
    const missing = cfg.expected.filter(e => !logs.some(l => l.trim() === e.trim()));
    resultEl.className = 'check-result fail';
    resultEl.innerHTML = `<strong>${matched.length} of ${total} correct.</strong> Still missing:<br>` +
      missing.map(m => `<code style="font-size:12px;background:rgba(0,0,0,0.08);padding:1px 5px;border-radius:3px">${esc(m)}</code>`).join('<br>');
  } else {
    resultEl.className = 'check-result fail';
    resultEl.innerHTML = `<strong>Not yet.</strong> ${cfg.failMsg}`;
  }
}

/* ── TAB SUPPORT ─────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.editor-textarea').forEach(el => {
    el.addEventListener('keydown', function(e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        const s = this.selectionStart;
        this.value = this.value.slice(0, s) + '  ' + this.value.slice(this.selectionEnd);
        this.selectionStart = this.selectionEnd = s + 2;
      }
    });
  });
});

/* ── ESCAPE HTML ─────────────────────────────────── */
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}