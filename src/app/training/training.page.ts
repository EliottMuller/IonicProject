import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { MLService, SavedModel } from '../services/ml.service';

@Component({
  selector: 'app-training',
  templateUrl: './training.page.html',
  styleUrls: ['./training.page.scss'],
})
export class TrainingPage implements OnInit {
  // ViewChild Elements
  @ViewChild('imageElement') imageElement!: ElementRef;
  @ViewChild('testImageElement') testImageElement!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('testFileInput') testFileInput!: ElementRef;

  // Properties
  savedModels: SavedModel[] = [];
  showSaveDialog: boolean = false;
  saveForm = { name: '', version: '', description: '' };
  selectedImage: string | null | undefined = null;
  testImage: string | null = null;
  selectedLabel: string = '';
  customLabel: string = '';
  predictions: Array<{ label: string; probability: number }> = [];
  selectedEpochs: number = 25; // Valeur par défaut
  currentTab = 'collect';
  addedImages: Array<{ image: string; label: string }> = [];
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  hasStoredModel: boolean = false;

  constructor(private mlService: MLService) {}

  // Getters
  get modelStatus() {
    return this.mlService.modelStatus;
  }

  // Life Cycle
  async ngOnInit() {
    this.hasStoredModel = await this.mlService.hasStoredModel();
    if (this.hasStoredModel) {
      try {
        await this.mlService.loadModel();
      } catch (error) {
        console.error('Erreur lors du chargement du modèle:', error);
      }
    }
    await this.loadSavedModels();
  }

  // Event Handlers
  onTabChange(event: any) {
    this.currentTab = event.detail.value;
  }

  async triggerImageUpload() {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt, // Permet à l'utilisateur de choisir entre la caméra ou la galerie
      });

      if (photo.webPath) {
        this.selectedImage = photo.webPath; // Assigner l'URL de l'image à la variable
        // Tu peux appeler une autre fonction ici pour traiter l'image si nécessaire
      }
    } catch (error) {
      this.showError("Erreur lors de l'importation ou de la prise de photo");
      console.error(error);
    }
  }

  async triggerTestImageUpload() {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt, // Permet à l'utilisateur de choisir entre la caméra ou la galerie
      });

      if (photo.webPath) {
        this.testImage = photo.webPath; // Assigner l'URL de l'image à la variable testImage
        // Tu peux appeler une autre fonction ici pour traiter l'image si nécessaire
      }
    } catch (error) {
      this.showError("Erreur lors de l'importation ou de la prise de photo");
      console.error(error);
    }
  }

  async addTrainingData() {
    if (!this.imageElement || !this.selectedImage) {
      this.showError('Veuillez sélectionner une image');
      return;
    }

    if (!this.selectedLabel) {
      this.showError('Veuillez sélectionner un type de panneau');
      return;
    }

    if (this.selectedLabel === 'autre' && !this.customLabel.trim()) {
      this.showError('Veuillez entrer un label personnalisé');
      return;
    }

    try {
      this.isLoading = true;
      const label =
        this.selectedLabel === 'autre' ? this.customLabel : this.selectedLabel;
      await this.mlService.addTrainingData(
        this.imageElement.nativeElement,
        label
      );

      this.addedImages.push({ image: this.selectedImage, label });
      this.showSuccess("Image ajoutée aux données d'entraînement");

      this.resetForm();
    } catch (error) {
      this.showError("Erreur lors de l'ajout de l'image");
    } finally {
      this.isLoading = false;
    }
  }

  // File Handlers
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result; // Assigner l'image à la variable selectedImage
      };
      reader.readAsDataURL(file); // Lire l'image comme Data URL
    }
  }

  async onTestImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      this.showError('Veuillez sélectionner une image valide');
      return;
    }

    this.readFile(file, (result: string) => {
      this.testImage = result;
    });
  }

  // Model Handling
  async trainModel() {
    try {
      this.isLoading = true;
      await this.mlService.trainModel(this.selectedEpochs);
      await this.mlService.saveModel();
      this.hasStoredModel = true;
      this.showSuccess('Modèle entraîné et sauvegardé avec succès');
    } catch (error) {
      this.showError("Erreur lors de l'entraînement");
    } finally {
      this.isLoading = false;
    }
  }

  async testModel() {
    if (!this.testImageElement || !this.testImage) {
      this.showError('Veuillez sélectionner une image de test');
      return;
    }

    try {
      this.isLoading = true;
      this.predictions = await this.mlService.predict(
        this.testImageElement.nativeElement
      );
      if (this.predictions.length === 0) {
        this.showError("Aucune prédiction n'a pu être faite");
      }
    } catch (error) {
      this.showError('Erreur lors du test');
      this.predictions = [];
    } finally {
      this.isLoading = false;
    }
  }

  async resetModel() {
    try {
      this.isLoading = true;
      await this.mlService.deleteStoredModel();
      this.hasStoredModel = false;
      this.showSuccess('Modèle réinitialisé avec succès');
    } catch (error) {
      this.showError('Erreur lors de la réinitialisation du modèle');
    } finally {
      this.isLoading = false;
    }
  }

  async saveToServer() {
    if (!this.saveForm.name || !this.saveForm.version) {
      this.showError('Le nom et la version sont requis');
      return;
    }

    try {
      this.isLoading = true;
      await this.mlService.saveModelToServer(
        this.saveForm.name,
        this.saveForm.version,
        this.saveForm.description
      );
      await this.loadSavedModels();
      this.showSuccess('Modèle sauvegardé sur le serveur avec succès');
      this.showSaveDialog = false;
      this.resetSaveForm();
    } catch (error) {
      this.showError('Erreur lors de la sauvegarde sur le serveur');
    } finally {
      this.isLoading = false;
    }
  }

  async loadFromServer(modelId: number) {
    try {
      this.isLoading = true;
      await this.mlService.loadModelFromServer(modelId);
      this.showSuccess('Modèle chargé depuis le serveur avec succès');
    } catch (error) {
      this.showError('Erreur lors du chargement depuis le serveur');
    } finally {
      this.isLoading = false;
    }
  }

  // Helpers
  private showError(message: string, duration: number = 3000) {
    this.errorMessage = message;
    setTimeout(() => (this.errorMessage = ''), duration);
  }

  private showSuccess(message: string, duration: number = 3000) {
    this.successMessage = message;
    setTimeout(() => (this.successMessage = ''), duration);
  }

  private resetForm() {
    this.selectedImage = null;
    this.selectedLabel = '';
    this.customLabel = '';
  }

  private resetSaveForm() {
    this.saveForm = { name: '', version: '', description: '' };
  }

  private readFile(file: File, callback: (result: string) => void) {
    const reader = new FileReader();
    reader.onload = (e) => callback(e.target?.result as string);
    reader.onerror = () =>
      this.showError('Erreur lors de la lecture du fichier');
    reader.readAsDataURL(file);
  }

  private async loadSavedModels() {
    try {
      this.savedModels = await this.mlService.getStoredModels();
    } catch (error) {
      this.showError('Erreur lors du chargement des modèles sauvegardés');
    }
  }

  getModelStatusColor(): string {
    const status = this.modelStatus.getValue().toLowerCase();
    if (status.includes('erreur')) return 'danger';
    if (status.includes('prêt')) return 'success';
    if (status.includes('chargement')) return 'warning';
    return 'medium';
  }

  getModelStatusIcon(): string {
    const status = this.modelStatus.getValue().toLowerCase();
    if (status.includes('erreur')) return 'alert-circle';
    if (status.includes('prêt')) return 'checkmark-circle';
    if (status.includes('chargement')) return 'sync';
    return 'information-circle';
  }

  getPredictionColor(probability: number): string {
    if (probability > 0.7) return 'success';
    if (probability > 0.4) return 'warning';
    return 'danger';
  }

  getBadgeColor(percentage: number): string {
    if (percentage > 75) return 'success';
    else if (percentage > 25) return 'warning';
    else return 'danger';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  async deleteSavedModel(modelId: number) {
    try {
      this.isLoading = true;
      await this.mlService.deleteSavedModel(modelId); // Utiliser le service pour supprimer
      await this.loadSavedModels(); // Recharger la liste des modèles sauvegardés
      this.showSuccess('Modèle supprimé avec succès');
    } catch (error) {
      this.showError('Erreur lors de la suppression du modèle');
    } finally {
      this.isLoading = false;
    }
  }

  removeImage(index: number) {
    this.addedImages.splice(index, 1);
  }
}
