import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import { Injectable } from '@angular/core';

interface InferenceOptions {
  embedding: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MobileNetService {
  private model: mobilenet.MobileNet | null = null;

  async loadModel(): Promise<void> {
    this.model = await mobilenet.load();
  }

  async extractFeatures(imageElement: HTMLImageElement): Promise<tf.Tensor> {
    if (!this.model) {
      throw new Error('MobileNet model not initialized');
    }

    const tensor = tf.browser.fromPixels(imageElement);
    const resized = tf.image.resizeBilinear(tensor, [224, 224]);
    const normalized = resized.toFloat().div(tf.scalar(255));
    const batched = normalized.expandDims(0);
    
    const options: InferenceOptions = { embedding: true };
    const features = await this.model.infer(batched, true) as tf.Tensor;
    
    // Cleanup intermediate tensors
    tensor.dispose();
    resized.dispose();
    normalized.dispose();
    batched.dispose();
    
    return features;
  }

  isModelLoaded(): boolean {
    return this.model !== null;
  }
}