#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function generateModels(modelDir = path.join(__dirname, 'model'), output = path.join(__dirname, 'models.json')) {
  const mapping = {};
  const prefix = path.basename(modelDir);
  if (!fs.existsSync(modelDir)) {
    fs.writeFileSync(output, JSON.stringify(mapping, null, 2) + '\n');
    return mapping;
  }
  for (const file of fs.readdirSync(modelDir)) {
    const ext = path.extname(file).toLowerCase();
    if (ext !== '.onnx' && ext !== '.safetensors') continue;
    const name = path.basename(file, ext);
    mapping[name] = `${prefix}/${file}`;
  }
  fs.writeFileSync(output, JSON.stringify(mapping, null, 2) + '\n');
  return mapping;
}

if (require.main === module) {
  const [, , modelDirArg, outputArg] = process.argv;
  generateModels(modelDirArg ? path.resolve(modelDirArg) : path.join(__dirname, 'model'),
                 outputArg ? path.resolve(outputArg) : path.join(__dirname, 'models.json'));
}

module.exports = generateModels;
