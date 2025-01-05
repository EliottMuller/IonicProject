import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { Historique } from '../models/historique.model';
import { HistoriqueService } from '../services/historique.service';

@Component({
  selector: 'app-detection-image',
  templateUrl: './detection-image.page.html',
  styleUrls: ['./detection-image.page.scss'],
})
export class DetectionImagePage implements AfterViewInit {
  image!: string;
  predictions: any[] = [];
  detectedObjects: string[] = [];
  isAnalyzing = false;
  selectedPrediction: number | null = null;
  detectionTime = 0;
  averageConfidence = 0;

  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('imageElement') imageElement!: ElementRef<HTMLImageElement>;

  constructor(
    private router: Router,
    private _history: HistoriqueService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private platform: Platform
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.image = navigation.extras.state['image'];
      this.predictions = navigation.extras.state['predictions'];
      this.detectionTime = navigation.extras.state['detectionTime'];
      this.calculateAverageConfidence();
      this.adjustForPlatform();
    }
  }
  private adjustForPlatform() {
    if (this.platform.is('ios')) {
      // Ajustements spécifiques iOS
      document.documentElement.style.setProperty('--ion-safe-area-top', '47px');
    }
  }

  ngAfterViewInit() {
    if (this.predictions.length > 0) {
      this.drawDetections();
    }
  }

  calculateAverageConfidence() {
    this.averageConfidence = Math.round(
      this.predictions.reduce((acc, pred) => acc + pred.score * 100, 0) /
        this.predictions.length
    );
  }

  get confidenceColor(): string {
    if (this.averageConfidence >= 90) return 'success';
    if (this.averageConfidence >= 70) return 'warning';
    return 'danger';
  }

  getConfidenceColor(score: number): string {
    const confidence = score * 100;
    if (confidence >= 90) return 'success';
    if (confidence >= 70) return 'warning';
    return 'danger';
  }

  async ajoutHistorique(prediction: any) {
    const alert = await this.alertController.create({
      header: "Ajouter à l'historique",
      message: `Voulez-vous sauvegarder la détection de "${prediction.class}" ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        },
        {
          text: 'Confirmer',
          handler: () => {
            const historique = new Historique();
            historique.image = this.image;
            historique.score = prediction.score;
            historique.nom = prediction.class;
            this._history.addToHistory(historique);
            this.router.navigate(['/historique']);
          },
        },
      ],
    });
    await alert.present();
  }

  highlightObject(index: number) {
    this.selectedPrediction = this.selectedPrediction === index ? null : index;
    this.drawDetections();

    // Scroll vers l'image si un objet est sélectionné
    if (this.selectedPrediction !== null) {
      this.imageElement.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  resetHighlight() {
    this.selectedPrediction = null;
    this.drawDetections();
  }

  drawDetections() {
    const canvas = this.canvasElement.nativeElement;
    const ctx = canvas.getContext('2d');
    const img = this.imageElement.nativeElement;

    // Obtenir les dimensions réelles
    const displayWidth = img.clientWidth;
    const displayHeight = img.clientHeight;

    // Définir les dimensions du canvas
    canvas.width = displayWidth;
    canvas.height = displayHeight;

    // Calculer le ratio
    const scaleX = displayWidth / img.naturalWidth;
    const scaleY = displayHeight / img.naturalHeight;

    ctx?.clearRect(0, 0, canvas.width, canvas.height);

    this.predictions.forEach((prediction, index) => {
      const [x, y, width, height] = prediction.bbox;
      const isSelected = this.selectedPrediction === index;

      // Appliquer le ratio aux coordonnées
      const scaledX = x * scaleX;
      const scaledY = y * scaleY;
      const scaledWidth = width * scaleX;
      const scaledHeight = height * scaleY;

      if (this.selectedPrediction === null || isSelected) {
        ctx!.strokeStyle = isSelected ? '#4c8dff' : 'rgba(0, 255, 0, 0.5)';
        ctx!.lineWidth = isSelected ? 4 : 2;
        ctx!.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

        if (isSelected) {
          ctx!.fillStyle = 'rgba(76, 141, 255, 0.3)';
          ctx!.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);

          const label = `${prediction.class} (${Math.round(
            prediction.score * 100
          )}%)`;
          ctx!.font = 'bold 16px Arial';
          const textWidth = ctx!.measureText(label).width;

          ctx!.fillStyle = '#4c8dff';
          ctx!.fillRect(scaledX, scaledY - 30, textWidth + 16, 30);

          ctx!.fillStyle = 'white';
          ctx!.fillText(label, scaledX + 8, scaledY - 10);
        }
      }
    });
  }

  async shareResults() {
    const text = this.predictions
      .map((p) => `${p.class}: ${Math.round(p.score * 100)}% de confiance`)
      .join('\n');

    try {
      await navigator.share({
        title: 'Résultats de détection',
        text: `J'ai détecté les objets suivants:\n${text}`,
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  }
}
