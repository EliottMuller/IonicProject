import { ModelConfig } from '../types/ml.types';

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  inputShape: [1024],
  hiddenUnits: [100, 50],
  numClasses: 0
};

export const TRAINING_CONFIG = {
  epochs: 10,
  batchSize: 32,
  learningRate: 0.0001
};