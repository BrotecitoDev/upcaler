const fileInput = document.getElementById('fileInput');
const modelSelect = document.getElementById('modelSelect');
const upscaleBtn = document.getElementById('upscaleBtn');
const downloadBtn = document.getElementById('downloadBtn');
const progress = document.getElementById('progress');
const message = document.getElementById('message');
const inputCanvas = document.getElementById('inputCanvas');
const outputCanvas = document.getElementById('outputCanvas');

let currentImg = null;
const sessions = new Map();
let currentBackend = 'CPU';

async function loadModelList() {
    try {
        const res = await fetch('models.json');
        const models = await res.json();
        for (const [name, url] of Object.entries(models)) {
            const opt = document.createElement('option');
            opt.value = url;
            opt.textContent = name;
            modelSelect.appendChild(opt);
        }
    } catch (e) {
        console.error('No se pudo cargar models.json', e);
        message.textContent = 'Error al cargar modelos';
    }
}

fileInput.addEventListener('change', ev => {
    const file = ev.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
        inputCanvas.width = img.width;
        inputCanvas.height = img.height;
        const ctx = inputCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        currentImg = img;
    };
    img.src = URL.createObjectURL(file);
});

modelSelect.addEventListener('change', async () => {
    if (modelSelect.value) {
        progress.classList.remove('hidden');
        progress.textContent = 'Cargando modelo...';
        try {
            await getSession(modelSelect.value);
            message.textContent = 'Modelo precargado';
        } catch (e) {
            console.error(e);
            message.textContent = 'Error cargando el modelo';
        } finally {
            progress.classList.add('hidden');
            progress.textContent = 'Procesando...';
        }
    }
});

async function getSession(url) {
    if (sessions.has(url)) {
        const {session, backend} = sessions.get(url);
        currentBackend = backend;
        return session;
    }
    const providers = ['wasm'];
    let backend = 'CPU';
    if (ort.env.webgl?.isSupported) {
        providers.unshift('webgl');
        backend = 'WebGL';
    }
    if (ort.env.webgpu) {
        try {
            await ort.env.webgpu.initialize();
            providers.unshift('webgpu');
            backend = 'WebGPU';
        } catch {
            // ignore if webgpu init fails
        }
    }
    const session = await ort.InferenceSession.create(url, {executionProviders: providers});
    if (!session.inputNames.length || !session.outputNames.length) {
        throw new Error('Modelo no válido');
    }
    sessions.set(url, {session, backend});
    currentBackend = backend;
    return session;
}

async function upscale() {
    if (!currentImg) {
        alert('Selecciona una imagen');
        return;
    }
    const modelURL = modelSelect.value;
    if (!modelURL) {
        alert('Selecciona un modelo');
        return;
    }
    progress.classList.remove('hidden');
    downloadBtn.disabled = true;
    message.textContent = '';
    try {
        const sess = await getSession(modelURL);
        const ctx = inputCanvas.getContext('2d');
        const {width, height} = inputCanvas;
        const inputData = ctx.getImageData(0, 0, width, height).data;
        const data = new Float32Array(width * height * 3);
        for (let i = 0; i < width * height; i++) {
            data[i] = inputData[i * 4] / 255;
            data[i + width * height] = inputData[i * 4 + 1] / 255;
            data[i + 2 * width * height] = inputData[i * 4 + 2] / 255;
        }
        const inputName = sess.inputNames[0];
        const feeds = {};
        feeds[inputName] = new ort.Tensor('float32', data, [1, 3, height, width]);
        const results = await sess.run(feeds);
        const outputName = sess.outputNames[0];
        const output = results[outputName];
        const outWidth = output.dims[3];
        const outHeight = output.dims[2];
        const scale = (outWidth / width).toFixed(2);
        const outData = output.data;
        outputCanvas.width = outWidth;
        outputCanvas.height = outHeight;
        const outCtx = outputCanvas.getContext('2d');
        const outImage = outCtx.createImageData(outWidth, outHeight);
        for (let i = 0; i < outWidth * outHeight; i++) {
            outImage.data[i * 4] = Math.min(255, Math.max(0, outData[i] * 255));
            outImage.data[i * 4 + 1] = Math.min(255, Math.max(0, outData[i + outWidth * outHeight] * 255));
            outImage.data[i * 4 + 2] = Math.min(255, Math.max(0, outData[i + 2 * outWidth * outHeight] * 255));
            outImage.data[i * 4 + 3] = 255;
        }
        outCtx.putImageData(outImage, 0, 0);
        message.textContent = `Escalado x${scale} usando ${currentBackend}`;
        downloadBtn.disabled = false;
    } catch (e) {
        console.error(e);
        message.textContent = 'Error durante el procesamiento';
    } finally {
        progress.classList.add('hidden');
    }
}

function download() {
    const link = document.createElement('a');
    link.download = 'upscaled.png';
    link.href = outputCanvas.toDataURL('image/png');
    link.click();
}

upscaleBtn.addEventListener('click', upscale);
downloadBtn.addEventListener('click', download);
loadModelList();

