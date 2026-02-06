# PWA Icons Placeholder

The PWA icons (icon-192.png and icon-512.png) need to be generated from icon.svg.

## Quick generation with ImageMagick (if installed):
```bash
convert public/icon.svg -resize 192x192 public/icon-192.png
convert public/icon.svg -resize 512x512 public/icon-512.png
```

## Or use online tools:
1. Upload icon.svg to https://realfavicongenerator.net/
2. Download generated icons
3. Place icon-192.png and icon-512.png in public/ directory

## Or use Figma/Sketch:
1. Open icon.svg in Figma/Sketch
2. Export as PNG at 192x192 and 512x512
3. Save as icon-192.png and icon-512.png
