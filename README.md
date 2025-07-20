# Upscaler IA en el navegador

Este proyecto provee una demostración sencilla para aumentar la resolución de imágenes utilizando modelos ONNX directamente en el navegador. Todo el código es estático y puede desplegarse en GitHub Pages sin dependencias adicionales.

Los modelos se almacenan localmente en la carpeta `model/`. Para actualizar la lista de modelos basta con ejecutar `generate_models.py`, que generará el archivo `models.json` utilizado por la interfaz web.

## Uso
1. Ejecuta `python generate_models.py` para actualizar `models.json` con los modelos presentes en la carpeta `model/`.
2. Abre `index.html` desde GitHub Pages o cualquier servidor estático.
3. Selecciona una imagen y el modelo deseado.
4. Pulsa **Upscale** para procesar la imagen.
5. Descarga el resultado en formato PNG si lo necesitas.

Los modelos se cargan localmente desde la carpeta `model/` gracias al archivo `models.json` generado.
