import Tesseract from 'tesseract.js';

class ImageAnalyzer {
  protected async analyzeImage(imagePath: string) {
    const {
      data: { text },
    } = await Tesseract.recognize(imagePath, 'eng');

    return text;
  }
}

export default ImageAnalyzer;
