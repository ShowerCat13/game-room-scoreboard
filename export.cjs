const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') getFiles(full, files);
    } else if (/\.(ts|tsx|css|json|html|js)$/.test(file)) {
      files.push(full);
    }
  });
  return files;
}

let output = '';
const configs = ['index.html', 'tailwind.config.js', 'vite.config.ts', 'package.json', 'tsconfig.json'];
const allFiles = [...configs.filter(f => fs.existsSync(f)), ...getFiles('src')];

allFiles.forEach(f => {
  const ext = path.extname(f).slice(1) || 'txt';
  output += `## File: ${f.replace(/\\/g, '/')}\n\`\`\`${ext}\n${fs.readFileSync(f, 'utf8')}\n\`\`\`\n\n`;
});

fs.writeFileSync('project_code.md', output);
console.log('Created project_code.md with', allFiles.length, 'files');
s