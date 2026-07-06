const sharp = require('sharp');

async function removeWhite() {
  const { data, info } = await sharp('public/logo.jpeg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const numChannels = info.channels;
  const outData = new Uint8Array(info.width * info.height * 4);
  
  for (let i = 0, j = 0; i < data.length; i += numChannels, j += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    outData[j] = r;
    outData[j + 1] = g;
    outData[j + 2] = b;
    
    // If pixel is very close to white
    if (r > 240 && g > 240 && b > 240) {
      outData[j + 3] = 0; // completely transparent
    } else {
      // Soft alpha edge for anti-aliasing
      const avg = (r + g + b) / 3;
      if (avg > 220) {
        outData[j + 3] = Math.max(0, 255 - ((avg - 220) * (255 / 35)));
      } else {
        outData[j + 3] = 255;
      }
    }
  }

  await sharp(outData, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .png()
  .toFile('public/logo.png');
  
  console.log("Successfully created transparent logo.png");
}

removeWhite().catch(console.error);
