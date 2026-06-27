import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDist = path.join(__dirname, 'dist');
const destRoot = path.resolve(__dirname, '..');

function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  fs.readdirSync(from).forEach(element => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
}

try {
  console.log('Copying build assets to root directory...');
  
  // Copy assets
  const srcAssets = path.join(srcDist, 'assets');
  const destAssets = path.join(destRoot, 'assets');
  copyFolderSync(srcAssets, destAssets);
  
  // Copy index.html
  const srcIndex = path.join(srcDist, 'index.html');
  const destIndex = path.join(destRoot, 'index.html');
  fs.copyFileSync(srcIndex, destIndex);

  console.log('Successfully deployed build to root directory!');
} catch (error) {
  console.error('Failed to copy build files:', error);
  process.exit(1);
}
