# Upscaler IA en el navegador

Este proyecto demuestra cómo aumentar la resolución de imágenes utilizando modelos ONNX directamente en el navegador. Todo el código es estático y puede desplegarse en GitHub Pages sin depender de un servidor.

Los modelos se almacenan localmente en la carpeta `model/`. Para actualizar la lista de modelos se provee el script `gen-models-json.js`, que genera el archivo `models.json` utilizado por la interfaz web.

## Uso
1. Ejecuta `node gen-models-json.js` para actualizar `models.json` con los modelos presentes en la carpeta `model/`.
2. Abre `index.html` desde GitHub Pages o cualquier servidor estático.
3. Selecciona una imagen y el modelo deseado.
4. Pulsa **Upscale** para procesar la imagen.
5. Descarga el resultado en formato PNG si lo necesitas.

Los modelos se cargan localmente desde la carpeta `model/` gracias al archivo `models.json` generado.
