const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let totalElements = 0;
let instances = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  // Handle both className="something" and className={'something'} and className={`something`}
  const regex = /className=[\"'\`]?([^\"'\`>\{]+)[\"'\`]?/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const clsStr = match[1].trim();
    // Exclude expressions or strings that seem like code
    if (clsStr.includes('?') || clsStr.includes(':') || clsStr.includes('$')) continue;
    
    const classes = clsStr.split(/\s+/).filter(Boolean);
    if (classes.length >= 2) {
      totalElements++;
      instances.push({file: f, classString: clsStr, classes: classes});
    }
  }
});

console.log('Total inline elements with 2+ classes:', totalElements);
fs.writeFileSync('inline_classes_report.json', JSON.stringify(instances, null, 2));
