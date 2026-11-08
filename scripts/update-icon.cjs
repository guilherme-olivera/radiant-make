const fs = require('fs');

const imgBase64 = fs.readFileSync('public/logo.jpg').toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <clipPath id="circleClip">
      <circle cx="256" cy="256" r="256" />
    </clipPath>
  </defs>
  <image href="data:image/jpeg;base64,${imgBase64}" width="512" height="512" clip-path="url(#circleClip)" />
</svg>`;

fs.writeFileSync('public/icon.svg', svg);
console.log('icon.svg atualizado com sucesso!');
