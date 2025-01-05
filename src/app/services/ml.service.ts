import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import * as tf from '@tensorflow/tfjs';
import { Logs } from '@tensorflow/tfjs-layers';
import { BehaviorSubject } from 'rxjs';
import { DEFAULT_MODEL_CONFIG, TRAINING_CONFIG } from '../config/model.config';
import { PredictionResult, TrainingData } from '../types/ml.types';
import { ModelConfig } from '../types/model.config';
import { MobileNetService } from './mobilenet.service';

export interface SavedModel {
  id: number;
  name: string;
  version: string;
  description: string;
  created_at: string;
  accuracy: number;
  num_classes: number;
  epochs_trained: number;
  model_topology: any;
  weight_specs: any;
  weight_data: any;
  labels: string[];
}

@Injectable({
  providedIn: 'root',
})
export class MLService {
  private model: tf.LayersModel | null = null;
  private labels: string[] = [];
  private trainingData: TrainingData[] = [];
  private modelConfig: ModelConfig = { ...DEFAULT_MODEL_CONFIG };

  modelStatus = new BehaviorSubject<string>('Non chargé');

  private readonly MODEL_PATH = 'indexeddb://road-signs-model';
  private readonly LABELS_PATH = 'indexeddb://road-signs-labels';

  private currentAccuracy: number = 0;
  private currentEpochsTrained: number = 0

  private supabase = createClient(
    'https://vadpykdrflqhzgexqwix.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZHB5a2RyZmxxaHpnZXhxd2l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3MjY3ODEsImV4cCI6MjA1MDMwMjc4MX0.abHTJkFW2_0rU4OwMBL57ChSFiI4OINAYirm9wTauqU'
  );

  constructor(private mobileNetService: MobileNetService) {
    this.initializeModel();
  }

  private async initializeModel(): Promise<void> {
    this.modelStatus.next('Chargement du modèle...');
    try {
      await this.mobileNetService.loadModel();
      this.modelStatus.next('Modèle prêt');
    } catch (error) {
      this.modelStatus.next('Erreur de chargement');
      console.error('Erreur lors du chargement du modèle:', error);
    }
  }

  async addTrainingData(
    imageElement: HTMLImageElement,
    label: string
  ): Promise<void> {
    if (!this.mobileNetService.isModelLoaded()) {
      throw new Error('Base model not initialized');
    }
    const features = await this.mobileNetService.extractFeatures(imageElement);
    this.trainingData.push({ image: features, label });
    if (!this.labels.includes(label)) {
      this.labels.push(label);
      this.modelConfig.numClasses = this.labels.length;
      await this.updateModelArchitecture();
    }
  }

  private async updateModelArchitecture(): Promise<void> {
    const layers = [
      tf.layers.dense({
        units: this.modelConfig.hiddenUnits[0],
        activation: 'relu',
        inputShape: [this.modelConfig.inputShape],
      }),
      tf.layers.dense({
        units: this.modelConfig.hiddenUnits[1],
        activation: 'relu',
      }),
      tf.layers.dense({
        units: this.modelConfig.numClasses,
        activation: 'softmax',
      }),
    ];

    this.model = tf.sequential({ layers });
  }

  async trainModel(epochs?: number): Promise<tf.History> {
    if (!this.model || this.trainingData.length === 0) {
      throw new Error('Model not initialized or no training data available');
    }

    const xs = tf.concat(this.trainingData.map((d) => d.image));
    const ys = tf.oneHot(
      tf.tensor1d(
        this.trainingData.map((d) => this.labels.indexOf(d.label)),
        'int32'
      ),
      this.labels.length
    );

    await this.model.compile({
      optimizer: tf.train.adam(TRAINING_CONFIG.learningRate),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });

    const history = await this.model.fit(xs, ys, {
      epochs: epochs || TRAINING_CONFIG.epochs,
      batchSize: TRAINING_CONFIG.batchSize,
      callbacks: {
        onEpochEnd: (epoch: number, logs?: Logs) => {
          const accuracy = logs ? logs['acc'] || logs['accuracy'] : undefined;
          if (accuracy !== undefined) {
            this.currentAccuracy = accuracy;
            this.currentEpochsTrained = epoch + 1;
            this.modelStatus.next(
              `Epoch ${epoch + 1}/${epochs || TRAINING_CONFIG.epochs}: accuracy = ${accuracy.toFixed(4)}`
            );
          }
        },
      },
    });

    // Cleanup tensors
    xs.dispose();
    ys.dispose();

    // Enregistrer le modèle après l'entraînement
    await this.saveModel();

    return history;
  }

  async predict(imageElement: HTMLImageElement): Promise<PredictionResult[]> {
    if (!this.model || !this.mobileNetService.isModelLoaded()) {
      throw new Error('Model not initialized');
    }

    const features = await this.mobileNetService.extractFeatures(imageElement);
    const prediction = this.model.predict(features) as tf.Tensor;
    const probabilities = await prediction.data();

    // Cleanup tensors
    features.dispose();
    prediction.dispose();

    return this.labels
      .map((label, i) => ({
        label,
        probability: probabilities[i],
      }))
      .sort((a, b) => b.probability - a.probability);
  }

  async saveModel(): Promise<void> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    try {
      // Sauvegarder le modèle dans IndexedDB
      await this.model.save(this.MODEL_PATH);

      // Sauvegarder les labels dans localStorage
      localStorage.setItem('road-signs-labels', JSON.stringify(this.labels));

      this.modelStatus.next('Modèle sauvegardé localement');
    } catch (error) {
      this.modelStatus.next('Erreur lors de la sauvegarde du modèle');
      console.error('Erreur de sauvegarde:', error);
      throw error;
    }
  }

  async loadModel(): Promise<void> {
    try {
      this.modelStatus.next('Chargement du modèle...');

      // Vérifier si un modèle existe dans IndexedDB
      const models = await tf.io.listModels();
      const modelExists = models[this.MODEL_PATH];
      const labelsExist = models[this.LABELS_PATH];

      if (!modelExists || !labelsExist) {
        this.modelStatus.next('Aucun modèle sauvegardé trouvé');
        return;
      }

      // Charger le modèle depuis IndexedDB
      this.model = await tf.loadLayersModel(this.MODEL_PATH);

      // Charger les labels depuis localStorage
      const savedLabels = localStorage.getItem('road-signs-labels');
      if (!savedLabels) {
        throw new Error('No labels found');
      }
      this.labels = JSON.parse(savedLabels);
      this.modelConfig.numClasses = this.labels.length;

      this.modelStatus.next('Modèle chargé depuis le stockage local');
    } catch (error) {
      this.modelStatus.next('Erreur lors du chargement du modèle');
      console.error('Erreur de chargement:', error);
      throw error;
    }
  }

  // Méthode pour vérifier si un modèle est déjà sauvegardé
  async hasStoredModel(): Promise<boolean> {
    const models = await tf.io.listModels();
    return !!models[this.MODEL_PATH] && !!models[this.LABELS_PATH];
  }

  // Méthode pour supprimer le modèle sauvegardé
  async deleteStoredModel(): Promise<void> {
    try {
      await tf.io.removeModel(this.MODEL_PATH);
      await tf.io.removeModel(this.LABELS_PATH);
      this.modelStatus.next('Modèle supprimé du stockage local');
    } catch (error) {
      console.error('Erreur lors de la suppression du modèle:', error);
      throw error;
    }
  }


  async saveModelToServer(name: string, version: string, description: string): Promise<void> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    try {
      this.modelStatus.next('Sauvegarde du modèle sur le serveur...');

      const artifacts = await this.model.save(
        tf.io.withSaveHandler(async (modelArtifacts) => {
          if (!modelArtifacts.weightData) {
            throw new Error('Weight data is missing');
          }

          const { error } = await this.supabase.from('models').insert({
            name: name,
            version: version,
            description: description,
            accuracy: this.currentAccuracy,
            num_classes: this.labels.length,
            epochs_trained: this.currentEpochsTrained,
            model_topology: modelArtifacts.modelTopology,
            weight_specs: modelArtifacts.weightSpecs,
            weight_data: Array.from(
              new Uint8Array(modelArtifacts.weightData as ArrayBuffer)
            ),
            labels: this.labels,
          });

          if (error) throw error;

          return {
            modelArtifactsInfo: {
              dateSaved: new Date(),
              modelTopologyType: 'JSON',
              modelTopologyBytes: JSON.stringify(modelArtifacts.modelTopology).length,
              weightSpecsBytes: JSON.stringify(modelArtifacts.weightSpecs).length,
              weightDataBytes: modelArtifacts.weightData instanceof ArrayBuffer
                ? modelArtifacts.weightData.byteLength
                : Array.from(modelArtifacts.weightData).reduce(
                    (a, b) => a + b.byteLength,
                    0
                  ),
            },
          };
        })
      );

      this.modelStatus.next('Modèle sauvegardé sur le serveur');
    } catch (error) {
      this.modelStatus.next('Erreur lors de la sauvegarde sur le serveur');
      console.error('Erreur de sauvegarde:', error);
      throw error;
    }
  }

  async getStoredModels(): Promise<SavedModel[]> {
    const { data, error } = await this.supabase
      .from('models')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async loadModelFromServer(modelId: number): Promise<void> {
    try {
      this.modelStatus.next('Chargement du modèle depuis le serveur...');

      const { data, error } = await this.supabase
        .from('models')
        .select('*')
        .eq('id', modelId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Aucun modèle trouvé');

      const modelArtifacts = {
        modelTopology: data.model_topology,
        weightSpecs: data.weight_specs,
        weightData: new Uint8Array(data.weight_data).buffer,
      };

      this.model = await tf.loadLayersModel(tf.io.fromMemory(modelArtifacts));
      this.labels = data.labels;
      this.modelConfig.numClasses = this.labels.length;
      this.currentAccuracy = data.accuracy;
      this.currentEpochsTrained = data.epochs_trained;

      this.modelStatus.next(`Modèle "${data.name}" v${data.version} chargé`);
    } catch (error) {
      this.modelStatus.next('Erreur lors du chargement depuis le serveur');
      console.error('Erreur de chargement:', error);
      throw error;
    }
  }

  async deleteSavedModel(modelId: number): Promise<void> {
    try {
        const { data, error } = await this.supabase
            .from('models') // Remplacez 'models' par le nom de votre table
            .delete()
            .eq('id', modelId); // Assurez-vous que 'id' est le nom de la colonne pour l'identifiant

        if (error) {
            throw new Error(`Erreur lors de la suppression du modèle : ${error.message}`);
        }

        console.log(`Modèle avec l'ID ${modelId} supprimé avec succès.`);
    } catch (error) {
        console.error(`Erreur lors de la suppression du modèle`);
        throw error; // Rejeter l'erreur pour la gestion ultérieure
    }
}
}