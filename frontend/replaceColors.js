import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const dir = 'C:/GrabIT/frontend/src';

walkDir(dir, function(filePath) {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/#ff4d2d/gi, '#16a34a'); // orange to green-600
    content = content.replace(/#e64526/gi, '#15803d'); // dark orange to green-700
    content = content.replace(/orange-50/gi, 'green-50'); 
    content = content.replace(/orange-600/gi, 'green-600'); 

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
