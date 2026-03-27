const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

(async () => {
    try {
        const publicDir = path.join(__dirname, 'public');
        const imgPath = path.join(publicDir, 'LOGO.png');
        
        console.log('Reading LOGO.png...');
        const img = await Jimp.read(imgPath);
        
        const w = img.bitmap.width;
        const h = img.bitmap.height;
        const size = Math.max(w, h);
        
        console.log(`Original Size: ${w}x${h}. Padding to square: ${size}x${size}`);
        
        // Create new transparent square image
        const square = new Jimp(size, size, 0x00000000); 
        
        // Calculate offsets to center the image
        const x = (size - w) / 2;
        const y = (size - h) / 2;
        
        // Composite the logo onto the center of the square background
        square.composite(img, x, y);
        
        console.log('Resizing to robust PWA dimensions...');
        // Save outputs
        square.clone().resize(192, 192).write(path.join(publicDir, 'icon-192.png'));
        square.clone().resize(512, 512).write(path.join(publicDir, 'icon-512.png'));
        
        console.log('Successfully generated square padded PWA icons! icon-192.png and icon-512.png saved.');
    } catch (err) {
        console.error('Failed to pad icons:', err);
    }
})();
