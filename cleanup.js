const fs = require('fs');
const path = require('path');

const directoriesToRemove = [
  'src/app/dashboard',
  'src/app/history',
  'src/app/interview',
  'src/app/profile'
];

directoriesToRemove.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    console.log(`Removing ${dir}...`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  } else {
    console.log(`${dir} does not exist, skipping.`);
  }
});

console.log('Cleanup complete! Now you can run: npm run build');
