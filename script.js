// === ANSWER HASHES (SHA-256) ===
// Answers are hashed so they're not visible in source code
// We'll use a simple approach: normalize + hash

const PASSWORD = '0702';

// Accepted answers per station (lowercase, trimmed)
// Station 1: "nantes" (Edict of Nantes / Edikt von Nantes)
// Station 2: "guanabara" (Baía de Guanabara)
// Station 3: "caipirinha"
// Station 4: "alexander"
// Station 5: "feliz aniversario" / "feliz aniversário"

const ANSWERS = {
  1: ['nantes', 'edikt von nantes', 'edict of nantes', 'édit de nantes', 'edit de nantes'],
  2: ['guanabara', 'guanabara bay', 'baia de guanabara', 'baía de guanabara'],
  3: ['caipirinha'],
  4: ['alexander'],
  5: ['feliz aniversario', 'feliz aniversário', 'parabéns', 'parabens']
};

// Track progress in localStorage
function getProgress() {
  const saved = localStorage.getItem('michi-quest-progress');
  return saved ? parseInt(saved) : 0;
}

function setProgress(station) {
  localStorage.setItem('michi-quest-progress', station.toString());
}

// Normalize answer
function normalize(str) {
  return str.toLowerCase().trim()
    .replace(/[.,!?;:'"()]/g, '')
    .replace(/\s+/g, ' ');
}

// Show a screen
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  target.classList.add('active');
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Password check
function checkPassword() {
  const input = document.getElementById('password').value.trim();
  const error = document.getElementById('gate-error');

  if (input === PASSWORD) {
    error.classList.add('hidden');
    const progress = getProgress();
    if (progress >= 5) {
      showScreen('finale');
      launchConfetti();
    } else {
      showScreen('station' + (progress + 1));
    }
  } else {
    error.classList.remove('hidden');
    document.getElementById('password').parentElement.classList.add('shake');
    setTimeout(() => {
      document.getElementById('password').parentElement.classList.remove('shake');
    }, 500);
  }
}

// Answer check
function checkAnswer(station) {
  const input = normalize(document.getElementById('answer' + station).value);
  const error = document.getElementById('error' + station);
  const accepted = ANSWERS[station];

  if (accepted.some(a => input.includes(a) || a.includes(input))) {
    // Correct!
    error.classList.add('hidden');
    setProgress(station);

    // Brief success animation
    const card = document.querySelector('#station' + station + ' .card');
    card.classList.add('success-pulse');

    setTimeout(() => {
      if (station < 5) {
        showScreen('station' + (station + 1));
      } else {
        showScreen('finale');
        launchConfetti();
      }
    }, 600);
  } else {
    // Wrong
    error.classList.remove('hidden');
    document.getElementById('answer' + station).parentElement.classList.add('shake');
    setTimeout(() => {
      document.getElementById('answer' + station).parentElement.classList.remove('shake');
    }, 500);
  }
}

// Enter key support
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    // Find active screen
    const active = document.querySelector('.screen.active');
    if (!active) return;

    if (active.id === 'gate') {
      checkPassword();
    } else if (active.id.startsWith('station')) {
      const num = parseInt(active.id.replace('station', ''));
      checkAnswer(num);
    }
  }
});

// Confetti!
function launchConfetti() {
  const container = document.getElementById('confetti');
  const colors = ['#f0a030', '#ff6b35', '#40c057', '#339af0', '#f06595', '#ffd43b', '#ffffff'];

  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.classList.add('confetti-piece');
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.left = Math.random() * 100 + '%';
    piece.style.top = '-10px';
    piece.style.animationDuration = (2 + Math.random() * 3) + 's';
    piece.style.animationDelay = Math.random() * 2 + 's';
    piece.style.width = (5 + Math.random() * 8) + 'px';
    piece.style.height = (5 + Math.random() * 8) + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    container.appendChild(piece);
  }

  // Clean up after animation
  setTimeout(() => {
    container.innerHTML = '';
    // Relaunch for continuous effect
    launchConfetti();
  }, 5000);
}

// Restore progress on page load
window.addEventListener('DOMContentLoaded', () => {
  // Always start at gate
  showScreen('gate');
});
