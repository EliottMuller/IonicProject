import * as tf from '@tensorflow/tfjs';
import { Logs } from '@tensorflow/tfjs-layers';

export interface TrainingData {
  image: tf.Tensor;
  label: string;
}

export interface PredictionResult {
  label: string;
  probability: number;
}

export interface ModelCallbacks {
  onEpochEnd?: (epoch: number, logs?: Logs) => void | Promise<void>;
}

export interface ModelConfig {
  inputShape: number[];
  hiddenUnits: number[];
  numClasses: number;
}