import { Component, ElementRef, ViewChild } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { getStorage, ref, getDownloadURL } from '@angular/fire/storage';
import { PredictionInterface } from '../interfaces/predictions.interface';

@Component({
  selector: 'app-test-model',
  templateUrl: './test-model.page.html',
  styleUrls: ['./test-model.page.scss'],
})
export class TestModelPage {
  @ViewChild('canvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;
  image: string | ArrayBuffer | null = null;
  model: any;
  predictions: PredictionInterface[] = [];

  constructor() {}

  async ngOnInit() {
    await this.loadCustomModel();
  }

  async loadCustomModel() {
    //ajouter la logique pour charger le modèle depuis FireStorage
   console.log("modèle charger")
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.image = reader.result;
        this.renderImageToCanvas();
      };
      reader.readAsDataURL(file);
    }
  }

  renderImageToCanvas() {
    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const img = new Image();
    img.src = this.image as string;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, img.width, img.height);
    };
  }

  async runDetection() {
    if (!this.model || !this.canvas) {
      console.error('Modèle ou canvas non disponible.');
      return;
    }

    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    // Effectuer la détection
    const img = tf.browser.fromPixels(canvas);
    this.predictions = await this.model.executeAsync(img.expandDims(0)) as any[];
    img.dispose();

    // Traiter et afficher les résultats
    this.predictions.forEach((prediction) => {
      const [x, y, width, height] = prediction.bbox;
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#FF4500';
      ctx.fillStyle = '#FF4500';
      ctx.stroke();
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(
        `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
        x + 5,
        y > 10 ? y - 5 : 10
      );
    });
  }

  getBadgeColor(percentage: number): string {
    if (percentage > 75) return 'success';
    else if (percentage > 25) return 'warning';
    else return 'danger';
  }
}
