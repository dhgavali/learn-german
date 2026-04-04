// ── DATA ──
let phrases = JSON.parse(localStorage.getItem('german-phrases') || '[]');

// ── RENDER LIST ──
function renderList() {
    const list = document.getElementById('phraseList');
    const empty = document.getElementById('emptyState');
    document.getElementById('listCount').textContent = phrases.length;

    if (phrases.length === 0) {
        list.innerHTML = '';
        list.appendChild(empty);
        return;
    }

    list.innerHTML = '';
    phrases.forEach((p, i) => {
        const card = document.createElement('div');
        card.className = 'phrase-card';
        card.style.animationDelay = (i * 0.07) + 's';
        card.innerHTML = `
      <span class="phrase-num">${String(i + 1).padStart(2, '0')}</span>
      ${p.photo ? `<img class="card-photo-thumb" src="${p.photo}" alt="visual"/>` : ''}
      <div style="flex:1;min-width:0">
        <div class="phrase-text">${escHtml(p.text)}</div>
        <div class="phrase-meta">Tap ▶ to start lesson</div>
      </div>
      <button class="btn-delete" onclick="deletePhrase(${i}, event)" title="Delete">
        <svg viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
      <button class="btn-play" onclick="playPhrase(${i})" title="Play">
        <svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
      </button>
    `;
        list.appendChild(card);
    });
}

function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── ADD ──
const inp = document.getElementById('phraseInput');
inp.addEventListener('input', () => {
    document.getElementById('charCount').textContent = inp.value.length + '/200';
});

async function addPhrase() {
    const text = inp.value.trim();
    if (!text) return;
    showToast('⏳ Translating…');
    try {
        const translation = await translateText(text);
        phrases.push({ text, translation, photo: pendingPhoto });
        localStorage.setItem('german-phrases', JSON.stringify(phrases));
        inp.value = '';
        document.getElementById('charCount').textContent = '0/200';
        removePhoto();
        renderList();
        showToast('✨ Phrase saved!');
    } catch (e) {
        showToast('⚠️ Translation failed. Try again.');
    }
}

inp.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addPhrase(); }
});

// ── DELETE ──
function deletePhrase(i, e) {
    e.stopPropagation();
    phrases.splice(i, 1);
    localStorage.setItem('german-phrases', JSON.stringify(phrases));
    renderList();
}

// ── TRANSLATE via Anthropic API ──
async function translateText(text) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{
                role: "user",
                content: `Translate the following English text to German. Reply with ONLY the German translation, nothing else, no explanation, no quotes.\n\nText: ${text}`
            }]
        })
    });
    const data = await response.json();
    const translated = data.content && data.content[0] && data.content[0].text;
    if (!translated) throw new Error('Translation failed');
    return translated.trim();
}

// ── NAVIGATION ──
let currentIdx = -1;

function playPhrase(i) {
    currentIdx = i;
    const p = phrases[i];
    goToPage2(p.text, p.translation);
}

function goToPage2(eng, ger) {
    document.getElementById('englishText').textContent = eng;
    document.getElementById('germanText').textContent = ger;

    // Reset state
    const germanCard = document.getElementById('germanCard');
    germanCard.classList.add('hidden-card');
    germanCard.classList.remove('reveal-anim');
    document.getElementById('replayBtn').classList.remove('visible');
    document.getElementById('speakIndicatorEn').classList.remove('active');
    document.getElementById('speakIndicatorDe').classList.remove('active');
    setStatus('Starting lesson…', false);

    // Set photo on result page
    const frame = document.getElementById('resultPhotoFrame');
    const rImg = document.getElementById('resultPhotoImg');
    const photo = phrases[currentIdx] && phrases[currentIdx].photo;
    if (photo) { rImg.src = photo; frame.classList.add('visible'); }
    else { rImg.src = ''; frame.classList.remove('visible'); }

    document.getElementById('page1').classList.remove('active');
    document.getElementById('page2').classList.add('active');

    // Start after short delay
    setTimeout(() => startLesson(eng, ger), 600);
}

function goBack() {
    stopSpeaking();
    document.getElementById('page2').classList.remove('active');
    document.getElementById('page1').classList.add('active');
}

// ── SPEECH ──
let synth = window.speechSynthesis;
let speaking = false;

function stopSpeaking() {
    synth.cancel();
    speaking = false;
    setSpeakingUI(false);
}

function setSpeakingUI(on, lang) {
    const avatar = document.getElementById('avatarCircle');
    const waves = document.getElementById('soundwaves');
    const teeth = document.getElementById('teethRect');
    const mouthPath = document.getElementById('mouthPath');

    if (on) {
        avatar.classList.add('speaking');
        waves.classList.add('active');
        if (teeth) teeth.style.animation = 'mouthOpen 0.22s ease-in-out infinite';
        if (teeth) teeth.setAttribute('opacity', '0.9');
        if (mouthPath) mouthPath.style.animation = 'mouthOpen 0.22s ease-in-out infinite';
    } else {
        avatar.classList.remove('speaking');
        waves.classList.remove('active');
        if (teeth) teeth.style.animation = '';
        if (teeth) teeth.setAttribute('opacity', '0');
        if (mouthPath) mouthPath.style.animation = '';
    }
}

function setStatus(text, speaking) {
    const pill = document.getElementById('statusPill');
    document.getElementById('statusText').textContent = text;
    if (speaking) pill.classList.add('speaking');
    else pill.classList.remove('speaking');
}

function speak(text, lang, onEnd) {
    // Do NOT cancel here — caller manages cancel before the sequence starts
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang;
    utt.rate = 0.9;
    utt.pitch = 1.05;

    // Pick best available voice for the language
    const voices = synth.getVoices();
    const best = voices.find(v => v.lang === lang)
        || voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    if (best) utt.voice = best;

    utt.onstart = () => setSpeakingUI(true, lang);
    utt.onend = () => { setSpeakingUI(false); if (onEnd) onEnd(); };
    utt.onerror = () => { setSpeakingUI(false); if (onEnd) onEnd(); };

    synth.speak(utt);
}

function startLesson(eng, ger) {
    synth.cancel(); // clear any stale queue before starting fresh
    // Step 1: speak English
    setStatus('🇬🇧 Speaking English…', true);
    document.getElementById('speakIndicatorEn').classList.add('active');

    speak(eng, 'en-US', () => {
        document.getElementById('speakIndicatorEn').classList.remove('active');
        setStatus('✨ Now revealing German…', false);

        // Step 2: reveal German with animation
        setTimeout(() => {
            const germanCard = document.getElementById('germanCard');
            germanCard.classList.remove('hidden-card');
            germanCard.classList.add('reveal-anim');

            // Step 3: speak German after reveal
            setTimeout(() => {
                setStatus('🇩🇪 Speaking German…', true);
                document.getElementById('speakIndicatorDe').classList.add('active');

                speak(ger, 'de-DE', () => {
                    document.getElementById('speakIndicatorDe').classList.remove('active');
                    setStatus('✅ Lesson complete!', false);
                    document.getElementById('replayBtn').classList.add('visible');
                });
            }, 700);
        }, 400);
    });
}

function replay() {
    if (currentIdx < 0) return;
    synth.cancel();
    const p = phrases[currentIdx];
    document.getElementById('germanCard').classList.add('hidden-card');
    document.getElementById('germanCard').classList.remove('reveal-anim');
    document.getElementById('replayBtn').classList.remove('visible');
    document.getElementById('speakIndicatorEn').classList.remove('active');
    document.getElementById('speakIndicatorDe').classList.remove('active');
    setStatus('Starting again…', false);
    setTimeout(() => startLesson(p.text, p.translation), 400);
}

// ── TOAST ──
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 2200);
}

// ── PHOTO ──
let pendingPhoto = null; // base64 string for current add session

function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    // Compress to max 400px wide to keep localStorage lean
    const reader = new FileReader();
    reader.onload = function (ev) {
        const img = new Image();
        img.onload = function () {
            const MAX = 400;
            const scale = Math.min(1, MAX / Math.max(img.width, img.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            pendingPhoto = canvas.toDataURL('image/jpeg', 0.75);
            // Show preview
            document.getElementById('photoPreviewImg').src = pendingPhoto;
            document.getElementById('photoPreviewWrap').classList.add('has-photo');
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

function removePhoto() {
    pendingPhoto = null;
    document.getElementById('photoInput').value = '';
    document.getElementById('photoPreviewImg').src = '';
    document.getElementById('photoPreviewWrap').classList.remove('has-photo');
}

// ── INIT ──
// Load voices
if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = () => { };
setTimeout(() => synth.getVoices(), 100);

renderList();

// Add sample phrase if empty
if (phrases.length === 0) {
    // Pre-load with a welcome phrase
    (async () => {
        try {
            const translation = await translateText("Hello, how are you?");
            phrases.push({ text: "Hello, how are you?", translation });
            localStorage.setItem('german-phrases', JSON.stringify(phrases));
            renderList();
        } catch (e) { }
    })();
}