const Jimp = require('jimp');

async function createCollage(imagePaths) {
  const collage = new Jimp(800, 600); // Adjust the dimensions as needed

  try {
    for (let i = 0; i < imagePaths.length; i++) {
      const image = await Jimp.read(imagePaths[i]);
      collage.blit(image, i * 200, 0); // Adjust the positioning as needed
    }

    const collagePath = 'collage.jpg';
    await collage.writeAsync(collagePath);
    return collagePath;
  } catch (error) {
    console.error('Error creating collage:', error);
    throw error;
  }
}

module.exports = { createCollage };
