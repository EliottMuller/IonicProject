export interface ModelConfig {
  inputShape: number;
  hiddenUnits: number[];
  numClasses: number;
}

export interface TrainingConfig {
  epochs: number;
  batchSize: number;
  learningRate: number;
}