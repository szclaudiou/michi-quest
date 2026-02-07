// =============================================
// MICHI'S QUEST — Schatzjagd 45
// =============================================

const PASSWORD = '0702';

// === PROGRESS ===
function getProgress() {
  return parseInt(localStorage.getItem('michi-quest-progress') || '0');
}
function setProgress(n) {
  localStorage.setItem('michi-quest-progress', n.toString());
}

// === SCREEN MANAGEMENT ===
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Init puzzle when showing
  if (id === 'station1') initMap1();
  if (id === 'station2') initMap2();
  if (id === 'station4') initLetters();
  if (id === 'station5') initCipher();
}

function advanceFrom(station) {
  setProgress(station);
  setTimeout(() => {
    if (station < 5) {
      showScreen('station' + (station + 1));
    } else {
      showScreen('finale');
      launchConfetti();
    }
  }, 1500);
}

// === PASSWORD ===
function checkPassword() {
  const input = document.getElementById('password').value.trim();
  const error = document.getElementById('gate-error');
  if (input === PASSWORD) {
    error.classList.add('hidden');
    const p = getProgress();
    if (p >= 5) { showScreen('finale'); launchConfetti(); }
    else showScreen('station' + (p + 1));
  } else {
    error.classList.remove('hidden');
    document.getElementById('password').parentElement.classList.add('shake');
    setTimeout(() => document.getElementById('password').parentElement.classList.remove('shake'), 500);
  }
}

// Enter key for password
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const active = document.querySelector('.screen.active');
    if (active && active.id === 'gate') checkPassword();
  }
});

// =============================================
// STATION 1: MAP OF FRANCE
// =============================================
let map1 = null;

const franceCities = [
  { name: 'Paris', lat: 48.8566, lng: 2.3522, correct: false },
  { name: 'Lyon', lat: 45.7640, lng: 4.8357, correct: false },
  { name: 'Nantes', lat: 47.2184, lng: -1.5536, correct: true },
  { name: 'Marseille', lat: 43.2965, lng: 5.3698, correct: false },
  { name: 'Strasbourg', lat: 48.5734, lng: 7.7521, correct: false },
  { name: 'Bordeaux', lat: 44.8378, lng: -0.5792, correct: false },
  { name: 'Toulouse', lat: 43.6047, lng: 1.4442, correct: false },
];

function initMap1() {
  if (map1) return;
  setTimeout(() => {
    map1 = L.map('map1', {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([46.8, 2.5], 6);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '©OSM ©CARTO',
      maxZoom: 18,
    }).addTo(map1);

    franceCities.forEach(city => {
      const icon = L.divIcon({
        className: 'city-marker',
        iconSize: [16, 16],
      });
      const marker = L.marker([city.lat, city.lng], { icon }).addTo(map1);
      marker.bindTooltip(city.name, { direction: 'top', offset: [0, -10] });
      marker.on('click', () => handleCityClick1(city, marker));
    });
  }, 100);
}

function handleCityClick1(city, marker) {
  const error = document.getElementById('error1');
  const success = document.getElementById('success1');

  if (city.correct) {
    error.classList.add('hidden');
    marker._icon.classList.add('correct');
    marker.bindPopup('<strong>✅ Nantes!</strong><br>Das Edikt von Nantes (1598)').openPopup();
    success.classList.remove('hidden');
    advanceFrom(1);
  } else {
    error.classList.remove('hidden');
    success.classList.add('hidden');
    marker._icon.classList.add('wrong');
    setTimeout(() => marker._icon.classList.remove('wrong'), 500);
  }
}

// =============================================
// STATION 2: MAP OF BRAZIL
// =============================================
let map2 = null;

const brazilBays = [
  { name: 'Baía de Guanabara (Rio de Janeiro)', lat: -22.8808, lng: -43.1729, correct: true },
  { name: 'Baía de Todos os Santos (Salvador)', lat: -12.9714, lng: -38.5124, correct: false },
  { name: 'Baía de Paranaguá', lat: -25.5069, lng: -48.5217, correct: false },
  { name: 'Recife', lat: -8.0476, lng: -34.8770, correct: false },
  { name: 'São Luís', lat: -2.5297, lng: -44.2825, correct: false },
  { name: 'Vitória', lat: -20.3155, lng: -40.3128, correct: false },
];

function initMap2() {
  if (map2) return;
  setTimeout(() => {
    map2 = L.map('map2', {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([-14, -42], 4);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '©OSM ©CARTO',
      maxZoom: 18,
    }).addTo(map2);

    brazilBays.forEach(bay => {
      const icon = L.divIcon({
        className: 'city-marker',
        iconSize: [16, 16],
      });
      const marker = L.marker([bay.lat, bay.lng], { icon }).addTo(map2);
      marker.bindTooltip(bay.name, { direction: 'top', offset: [0, -10] });
      marker.on('click', () => handleBayClick2(bay, marker));
    });
  }, 100);
}

function handleBayClick2(bay, marker) {
  const error = document.getElementById('error2');
  const success = document.getElementById('success2');

  if (bay.correct) {
    error.classList.add('hidden');
    marker._icon.classList.add('correct');
    marker.bindPopup('<strong>✅ Baía de Guanabara!</strong><br>Hier lag France Antarctique 🏖️').openPopup();
    success.classList.remove('hidden');
    advanceFrom(2);
  } else {
    error.classList.remove('hidden');
    success.classList.add('hidden');
    marker._icon.classList.add('wrong');
    setTimeout(() => marker._icon.classList.remove('wrong'), 500);
  }
}

// =============================================
// STATION 3: COCKTAIL BUILDER
// =============================================
const CORRECT_INGREDIENTS = new Set(['lime', 'sugar', 'cachaca', 'ice']);
let selectedIngredients = new Set();

function toggleIngredient(el) {
  const name = el.dataset.name;

  // Reset wrong/correct state
  document.querySelectorAll('.ingredient').forEach(i => {
    i.classList.remove('wrong', 'correct');
  });
  document.getElementById('error3').classList.add('hidden');
  document.getElementById('success3').classList.add('hidden');

  if (selectedIngredients.has(name)) {
    selectedIngredients.delete(name);
    el.classList.remove('selected');
  } else {
    if (selectedIngredients.size >= 4) return; // Max 4
    selectedIngredients.add(name);
    el.classList.add('selected');
  }

  // Update glass
  const fillPct = (selectedIngredients.size / 4) * 100;
  document.getElementById('glass-contents').style.height = fillPct + '%';
  document.getElementById('ingredient-count').textContent = selectedIngredients.size;

  // Enable mix button at 4
  document.getElementById('mix-btn').disabled = selectedIngredients.size !== 4;
}

function checkCocktail() {
  const error = document.getElementById('error3');
  const success = document.getElementById('success3');

  const isCorrect =
    selectedIngredients.size === 4 &&
    [...CORRECT_INGREDIENTS].every(i => selectedIngredients.has(i));

  if (isCorrect) {
    error.classList.add('hidden');
    document.querySelectorAll('.ingredient.selected').forEach(el => {
      el.classList.add('correct');
    });
    success.classList.remove('hidden');
    advanceFrom(3);
  } else {
    success.classList.add('hidden');
    error.classList.remove('hidden');

    document.querySelectorAll('.ingredient.selected').forEach(el => {
      const name = el.dataset.name;
      if (CORRECT_INGREDIENTS.has(name)) {
        el.classList.add('correct');
      } else {
        el.classList.add('wrong');
      }
    });

    // Reset after showing feedback
    setTimeout(() => {
      selectedIngredients.clear();
      document.querySelectorAll('.ingredient').forEach(el => {
        el.classList.remove('selected', 'wrong', 'correct');
      });
      document.getElementById('glass-contents').style.height = '0%';
      document.getElementById('ingredient-count').textContent = '0';
      document.getElementById('mix-btn').disabled = true;
    }, 1500);
  }
}

// =============================================
// STATION 4: LETTER SCRAMBLE
// =============================================
const TARGET_WORD = 'ALEXANDER';
let letterState = [];
let currentSlot = 0;

function initLetters() {
  // Only init once
  if (document.getElementById('letter-pool').children.length > 0) return;

  // Scramble letters
  const letters = TARGET_WORD.split('');
  const scrambled = [...letters].sort(() => Math.random() - 0.5);

  // Make sure it's actually scrambled
  if (scrambled.join('') === TARGET_WORD) {
    // Swap first two
    [scrambled[0], scrambled[1]] = [scrambled[1], scrambled[0]];
  }

  const pool = document.getElementById('letter-pool');
  scrambled.forEach((letter, i) => {
    const tile = document.createElement('div');
    tile.className = 'letter-tile';
    tile.textContent = letter;
    tile.dataset.index = i;
    tile.addEventListener('click', () => pickLetter(tile));
    pool.appendChild(tile);
  });

  letterState = [];
  currentSlot = 0;
}

function pickLetter(tile) {
  if (tile.classList.contains('used') || currentSlot >= TARGET_WORD.length) return;

  tile.classList.add('used');
  const slot = document.querySelectorAll('.letter-slot')[currentSlot];
  slot.textContent = tile.textContent;
  slot.classList.add('filled');
  letterState.push({ tile, slot, letter: tile.textContent });
  currentSlot++;

  // Check when all slots filled
  if (currentSlot === TARGET_WORD.length) {
    const word = letterState.map(s => s.letter).join('');
    setTimeout(() => checkWord(word), 300);
  }
}

function checkWord(word) {
  const error = document.getElementById('error4');
  const success = document.getElementById('success4');

  if (word === TARGET_WORD) {
    error.classList.add('hidden');
    document.querySelectorAll('.letter-slot').forEach(s => s.classList.add('correct'));
    success.classList.remove('hidden');
    advanceFrom(4);
  } else {
    success.classList.add('hidden');
    error.classList.remove('hidden');

    // Show which are right/wrong
    letterState.forEach((s, i) => {
      if (s.letter === TARGET_WORD[i]) {
        s.slot.classList.add('correct');
      } else {
        s.slot.classList.add('wrong');
      }
    });

    setTimeout(() => resetLetters(), 1200);
  }
}

function resetLetters() {
  letterState.forEach(s => {
    s.tile.classList.remove('used');
    s.slot.textContent = '';
    s.slot.classList.remove('filled', 'correct', 'wrong');
  });
  letterState = [];
  currentSlot = 0;
  document.getElementById('error4').classList.add('hidden');
}

// =============================================
// STATION 5: CAESAR CIPHER
// =============================================
const ORIGINAL_TEXT = 'FELIZ ANIVERSARIO';
const CIPHER_SHIFT = 3; // Shift by 3 (classic Caesar)
let currentShift = 0;

function caesarEncrypt(text, shift) {
  return text.split('').map(ch => {
    if (ch >= 'A' && ch <= 'Z') {
      return String.fromCharCode(((ch.charCodeAt(0) - 65 + shift) % 26 + 26) % 26 + 65);
    }
    return ch;
  }).join('');
}

function caesarDecrypt(encrypted, shift) {
  return caesarEncrypt(encrypted, -shift);
}

function initCipher() {
  const encrypted = caesarEncrypt(ORIGINAL_TEXT, CIPHER_SHIFT);
  document.getElementById('cipher-encrypted').textContent = encrypted;
  currentShift = 0;
  updateCipherDisplay();
}

function updateCipherDisplay() {
  const encrypted = document.getElementById('cipher-encrypted').textContent;
  const decoded = caesarDecrypt(encrypted, currentShift);
  document.getElementById('cipher-decoded').textContent = decoded;
  document.getElementById('shift-value').textContent = currentShift;
  document.getElementById('shift-slider').value = currentShift;
}

function adjustShift(delta) {
  currentShift = ((currentShift + delta) % 26 + 26) % 26;
  updateCipherDisplay();
}

function setShift(val) {
  currentShift = val;
  updateCipherDisplay();
}

function checkCipher() {
  const decoded = document.getElementById('cipher-decoded').textContent;
  const error = document.getElementById('error5');
  const success = document.getElementById('success5');

  if (decoded === ORIGINAL_TEXT) {
    error.classList.add('hidden');
    document.querySelector('.cipher-decoded').style.color = '#40c057';
    success.classList.remove('hidden');
    advanceFrom(5);
  } else {
    success.classList.add('hidden');
    error.classList.remove('hidden');
  }
}

// =============================================
// CONFETTI
// =============================================
let confettiInterval = null;

function launchConfetti() {
  const container = document.getElementById('confetti');
  const colors = ['#f0a030', '#ff6b35', '#40c057', '#339af0', '#f06595', '#ffd43b', '#ffffff'];

  function burst() {
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement('div');
      piece.classList.add('confetti-piece');
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.left = Math.random() * 100 + '%';
      piece.style.top = '-10px';
      piece.style.animationDuration = (2 + Math.random() * 3) + 's';
      piece.style.animationDelay = Math.random() * 1.5 + 's';
      piece.style.width = (5 + Math.random() * 8) + 'px';
      piece.style.height = (5 + Math.random() * 8) + 'px';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      container.appendChild(piece);

      // Clean up after animation
      setTimeout(() => piece.remove(), 6000);
    }
  }

  burst();
  confettiInterval = setInterval(burst, 4000);

  // Stop after 20 seconds
  setTimeout(() => {
    if (confettiInterval) clearInterval(confettiInterval);
  }, 20000);
}

// =============================================
// INIT
// =============================================
window.addEventListener('DOMContentLoaded', () => {
  showScreen('gate');
});
