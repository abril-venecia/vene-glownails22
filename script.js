// --- SISTEMA DE SONIDOS (Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playPop() {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.7, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

// --- PRECIOS ---
const precios = {
  "tecnica": {
    "💅 Esmaltado Semi": 10000,
    "🛡️ Kapping": 13000,
    "💎 Kapping Polygel": 15000,
    "✨ Kapping Gel": 15000,
    "🌸 Soft Gel": 15000,
    "💖 Esculpidas Polygel": 20000,
    "👑 Esculpidas con Gel": 23000
  },
  "decoraciones": {
    "🌟 Blooming": 500,
    "🐈 Ojo de Gato": 250,
    "🤍 Francesita": 200,
    "✨ Strass": 500,
    "🏔️ Relieve": 600,
    "🧊 Perlado": 500
  },
  "extras": {
    "🌈 Tonos Extra": 100,
    "🔄 Cambio de Forma": 500
  },
  "retiro": {
    "🧴 Softgel": 150,
    "🧽 Rubber/Semi": 100
  },
  "reposiciones": {
    "🩹 Softgel": 350,
    "🩹 Gel Semi": 250
  }
};

let state = {
    tecnica: null, decoraciones: {}, extras: { "🌈 Tonos Extra": 0, "🔄 Cambio de Forma": false },
    retiro: {}, reposiciones: {}
};
let currentStep = 0;

window.onload = () => {
    initApp();
    setupTouchSwipe();
    
    // Habilitar el audio context al primer toque (política de navegadores)
    document.body.addEventListener('touchstart', () => {
        if(audioCtx.state === 'suspended') audioCtx.resume();
    }, { once: true });
};

function initApp() {
    renderTecnicas();
    renderCounters(precios.decoraciones, 'decoraciones', 'container-decoraciones');
    renderCounters({ "🌈 Tonos Extra": precios.extras["🌈 Tonos Extra"] }, 'extras', 'container-extras');
    renderCounters(precios.retiro, 'retiro', 'container-retiro');
    renderCounters(precios.reposiciones, 'reposiciones', 'container-reposiciones');
    
    document.getElementById('label-forma').innerHTML = `
        <span>🔄 Cambio de Forma</span>
        <span class="price-tag">($${precios.extras["🔄 Cambio de Forma"]})</span>
    `;
    calculateTotal();
    updateDots();
}

function renderTecnicas() {
    const container = document.getElementById('container-tecnica');
    container.innerHTML = '';
    for (let key in precios.tecnica) {
        const btn = document.createElement('button');
        btn.className = 'tech-btn';
        btn.innerHTML = `<span>${key}</span><span class="price-tag">$${precios.tecnica[key]}</span>`;
        btn.onclick = () => {
            playPop();
            selectTecnica(key, btn);
        };
        container.appendChild(btn);
    }
}

function selectTecnica(nombre, btnElement) {
    state.tecnica = nombre;
    document.querySelectorAll('.tech-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
    calculateTotal();
}

function renderCounters(objData, category, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    for (let key in objData) {
        if(category !== 'extras') state[category][key] = 0;
        const precio = objData[key];

        const row = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = `
            <div class="item-info">
                <span>${key}</span>
                <span class="price-tag">($${precio})</span>
            </div>
            <div class="counter">
                <button class="btn-count" onclick="updateCount(this, '${category}', '${key}', -1)">-</button>
                <span class="count-val" id="val-${category}-${key.replace(/\s+/g, '')}">0</span>
                <button class="btn-count" onclick="updateCount(this, '${category}', '${key}', 1)">+</button>
            </div>
        `;
        container.appendChild(row);
    }
}

function updateCount(btnElement, category, key, change) {
    playPop();
    // Animación del botón
    btnElement.classList.remove('pop-anim');
    void btnElement.offsetWidth; // Forzar reflow para reiniciar la animación
    btnElement.classList.add('pop-anim');

    let currentVal = state[category][key];
    let newVal = currentVal + change;
    if (newVal < 0) newVal = 0; 
    if (category !== 'extras' && newVal > 10) newVal = 10;
    
    state[category][key] = newVal;
    document.getElementById(`val-${category}-${key.replace(/\s+/g, '')}`).innerText = newVal;
    calculateTotal();
}

// --- SLIDER Y ESFERAS DE PROGRESO ---
function updateSlider() {
    const slider = document.getElementById('slider');
    slider.style.transform = `translateX(-${currentStep * 20}%)`;
    updateDots();
}

function updateDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.remove('active', 'completed');
        if (index === currentStep) {
            dot.classList.add('active');
        } else if (index < currentStep) {
            dot.classList.add('completed');
        }
    });
}

function nextStep() { if (currentStep < 4) { currentStep++; updateSlider(); } }
function prevStep() { if (currentStep > 0) { currentStep--; updateSlider(); } }

function setupTouchSwipe() {
    let touchstartX = 0;
    let touchendX = 0;
    const sliderContainer = document.querySelector('.slider-container');

    sliderContainer.addEventListener('touchstart', e => { touchstartX = e.changedTouches[0].screenX; }, {passive: true});
    sliderContainer.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX;
        if (touchendX < touchstartX - 50) nextStep();
        if (touchendX > touchstartX + 50) prevStep();
    }, {passive: true});
}

// --- CÁLCULOS ---
function calculateTotal() {
    let total = 0;
    if (state.tecnica) total += precios.tecnica[state.tecnica];

    const sumCategory = (catState, catPrices) => {
        for (let key in catState) { total += (catState[key] * catPrices[key]); }
    };

    sumCategory(state.decoraciones, precios.decoraciones);
    sumCategory(state.retiro, precios.retiro);
    sumCategory(state.reposiciones, precios.reposiciones);
    total += (state.extras["🌈 Tonos Extra"] * precios.extras["🌈 Tonos Extra"]);

    const switchForma = document.getElementById('switch-forma').checked;
    state.extras["🔄 Cambio de Forma"] = switchForma; 
    if (switchForma) total += precios.extras["🔄 Cambio de Forma"];

    document.getElementById('total-price').innerText = total;
}

function resetCalculator() {
    state.tecnica = null;
    document.querySelectorAll('.tech-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('switch-forma').checked = false;

    ['decoraciones', 'retiro', 'reposiciones'].forEach(cat => {
        for (let key in state[cat]) state[cat][key] = 0;
    });
    state.extras["🌈 Tonos Extra"] = 0;
    state.extras["🔄 Cambio de Forma"] = false;

    document.querySelectorAll('.count-val').forEach(el => el.innerText = "0");

    currentStep = 0;
    updateSlider();
    calculateTotal();
}

// --- COMPARTIR POR WHATSAPP ---
function compartirWhatsApp() {
    let total = document.getElementById('total-price').innerText;
    
    if (total == 0 || !state.tecnica) {
        alert("¡Por favor selecciona al menos una técnica antes de enviar! 💅");
        return;
    }

    let mensaje = "✨ *PRESUPUESTO VENE GLOWNAILS* ✨\n";
    mensaje += "👤 _by Abril Tevez_\n";
    mensaje += "-----------------------------------\n\n";

    mensaje += `💅 *Técnica:*\n`;
    mensaje += `• ${state.tecnica} -> *$${precios.tecnica[state.tecnica]}*\n\n`;

    const agregarItems = (categoria, titulo, emojiTitulo) => {
        let hayItems = false;
        let subTexto = `${emojiTitulo} *${titulo}:*\n`;
        
        for (let key in state[categoria]) {
            let cantidad = state[categoria][key];
            if (cantidad > 0) {
                hayItems = true;
                let subtotal = cantidad * precios[categoria][key];
                subTexto += `• ${cantidad}x ${key} -> *$${subtotal}*\n`;
            }
        }
        if (hayItems) mensaje += subTexto + "\n";
    };

    agregarItems('decoraciones', 'Decoraciones', '🎀');
    agregarItems('retiro', 'Retiro', '🧴');
    agregarItems('reposiciones', 'Reposiciones', '🩹');

    let hayExtras = false;
    let textoExtras = `✨ *Extras:*\n`;
    
    if (state.extras["🌈 Tonos Extra"] > 0) {
        hayExtras = true;
        let subtotalTonos = state.extras["🌈 Tonos Extra"] * precios.extras["🌈 Tonos Extra"];
        textoExtras += `• ${state.extras["🌈 Tonos Extra"]}x 🌈 Tonos Extra -> *$${subtotalTonos}*\n`;
    }
    
    if (state.extras["🔄 Cambio de Forma"]) {
        hayExtras = true;
        textoExtras += `• 🔄 Cambio de Forma -> *$${precios.extras["🔄 Cambio de Forma"]}*\n`;
    }
    
    if (hayExtras) mensaje += textoExtras + "\n";

    mensaje += "-----------------------------------\n";
    mensaje += `💰 *TOTAL ESTIMADO: $${total}*\n`;
    mensaje += "-----------------------------------\n\n";
    mensaje += `_¡Te espero para dejarte las uñas hermosas!_ 💖`;

    const numeroTelefono = "5491141443946";
    const url = `https://wa.me/${numeroTelefono}?text=${encodeURIComponent(mensaje)}`;
    
    window.open(url, '_blank');
}