const fs = require('fs');
const sharp = require('sharp');

const sizes = [192, 512];

async function generateIcons() {
  const svgBuffer = fs.readFileSync('public/icon.svg');

  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(`public/icon-${size}.png`);

    console.log(`✓ Generated icon-${size}.png`);
  }

  // Also generate apple-touch-icon (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');

  console.log('✓ Generated apple-touch-icon.png');

  console.log('\n✓ All icons generated successfully!');
}

generateIcons().catch(console.error);
