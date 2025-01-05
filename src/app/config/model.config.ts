import { ModelConfig, TrainingConfig } from '../types/model.config';

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  inputShape: 1024,
  hiddenUnits: [100, 50],
  numClasses: 1  // Set minimum default to 1
};

export const TRAINING_CONFIG: TrainingConfig = {
  epochs: 10,
  batchSize: 32,
  learningRate: 0.0001
};