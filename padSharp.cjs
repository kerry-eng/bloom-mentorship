const sharp = require('sharp');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const imgPath = path.join(publicDir, 'LOGO.png');

sharp(imgPath)
  .metadata()
  .then(metadata => {
    const size = Math.max(metadata.width, metadata.height);
    return sharp(imgPath)
      .resize({
        width: size,
        height: size,
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toBuffer();
  })
  .then(buffer => {
    Promise.all([
      sharp(buffer).resize(512, 512).toFile(path.join(publicDir, 'icon-512.png')),
      sharp(buffer).resize(192, 192).toFile(path.join(publicDir, 'icon-192.png'))
    ]).then(() => {
        console.log("Sharp icons generated!");
    });
  })
  .catch(err => console.error("Sharp Error:", err));
