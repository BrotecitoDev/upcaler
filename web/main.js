// Lógica principal para cargar imágenes y ejecutar modelos ONNX

// Elementos del DOM
const fileInput = document.getElementById('fileInput');
const modelSelect = document.getElementById('modelSelect');
const upscaleBtn = document.getElementById('upscaleBtn');
const downloadBtn = document.getElementById('downloadBtn');
const progress = document.getElementById('progress');
const message = document.getElementById('message');
const inputCanvas = document.getElementById('inputCanvas');
const outputCanvas = document.getElementById('outputCanvas');

let currentImg = null;       // Imagen cargada por el usuario
let session = null;          // Sesión ONNX cargada
let sessionModelURL = null;  // URL del modelo actual

// Carga la lista de modelos disponibles desde models.json
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
        message.textContent = 'Error al cargar la lista de modelos';
    }
}

// Muestra la imagen seleccionada en el canvas de entrada
fileInput.addEventListener('change', (ev) => {
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

// Carga una sesión de ONNX Runtime desde la URL indicada
async function getSession(url) {
    if (session && url === sessionModelURL) {
        return session;
    }
    // Selección automática de proveedor: WebGPU > WebGL > CPU
    const providers = ['wasm'];
    if (ort.env.webgl && ort.env.webgl.isSupported) {
        providers.unshift('webgl');
    }
    if (ort.env.webgpu) {
        try {
            await ort.env.webgpu.initialize();
            providers.unshift('webgpu');
        } catch (e) {
            console.log('WebGPU no disponible', e);
        }
    }
    message.textContent = 'Usando: ' + providers.join(', ');
    session = await ort.InferenceSession.create(url, {executionProviders: providers});
    sessionModelURL = url;
    return session;
}

// Procesa la imagen con el modelo seleccionado
async function upscale() {
    if (!currentImg) {
        alert('Primero selecciona una imagen');
        return;
    }
    progress.classList.remove('hidden');
    downloadBtn.disabled = true;
    const modelURL = modelSelect.value;
    const sess = await getSession(modelURL);

    const ctx = inputCanvas.getContext('2d');
    const {width, height} = inputCanvas;
    const inputData = ctx.getImageData(0, 0, width, height).data;

    // Preprocesado: se normaliza a [0,1] y se reordena a CHW
    const data = new Float32Array(width * height * 3);
    for (let i = 0; i < width * height; i++) {
        data[i] = inputData[i * 4] / 255;               // R
        data[i + width * height] = inputData[i * 4 + 1] / 255; // G
        data[i + 2 * width * height] = inputData[i * 4 + 2] / 255; // B
    }

    const inputTensor = new ort.Tensor('float32', data, [1, 3, height, width]);
    const feeds = {};
    feeds[sess.inputNames[0]] = inputTensor;

    let output;
    try {
        const results = await sess.run(feeds);
        output = results[sess.outputNames[0]];
    } catch (e) {
        console.error(e);
        message.textContent = 'Error ejecutando el modelo';
        progress.classList.add('hidden');
        return;
    }

    const outWidth = output.dims[3];
    const outHeight = output.dims[2];
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
    downloadBtn.disabled = false;
    progress.classList.add('hidden');
}

// Descarga la imagen resultante en formato PNG
function download() {
    const link = document.createElement('a');
    link.download = 'upscaled.png';
    link.href = outputCanvas.toDataURL('image/png');
    link.click();
}

upscaleBtn.addEventListener('click', upscale);
downloadBtn.addEventListener('click', download);

// Inicialización
loadModelList();
