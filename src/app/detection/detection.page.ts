import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs';
import { PredictionInterface } from '../interfaces/predictions.interface';
import { Platform, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-detection',
  templateUrl: './detection.page.html',
  styleUrls: ['./detection.page.scss'],
})
export class DetectionPage implements OnInit {
  model: any;
  loading!: HTMLIonLoadingElement;
  @ViewChild('canvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('video', { static: false }) video!: ElementRef<HTMLVideoElement>;
  detectInterval: number = 50; // Run detection every 100ms for better performance
  detectedObjects: any[] = [];

  constructor(private platform: Platform, private loadingController: LoadingController) {}

  async ngOnInit() {
    await this.presentLoading(); // Show loading indicator

    try {
      await tf.setBackend('webgl');
      await tf.ready();
      this.model = await cocoSsd.load();
      console.log('Model loaded:', this.model);

      await this.dismissLoading(); // Dismiss loading indicator after model is ready
      this.startCamera();
    } catch (error) {
      console.error('Error loading model:', error);
      await this.dismissLoading(); // Dismiss if there's an error
    }
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: 'Loading model...',
      spinner: 'crescent'
    });
    await this.loading.present();
  }

  async dismissLoading() {
    if (this.loading) {
      await this.loading.dismiss();
    }
  }

  async startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      this.video.nativeElement.srcObject = stream;
      this.video.nativeElement.play();
      this.video.nativeElement.addEventListener('loadeddata', () => {
        // Set canvas dimensions to match video dimensions
        this.canvas.nativeElement.width = this.video.nativeElement.videoWidth;
        this.canvas.nativeElement.height = this.video.nativeElement.videoHeight;
        this.detectObjects(); // Start detection after camera feed is loaded
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Please allow camera access in your device settings.');
    }
  }

  async detectObjects() {
    if (!this.model) {
      console.error('Model not loaded!');
      return;
    }

    const predictions: PredictionInterface[] = await this.model.detect(this.video.nativeElement);
    this.updateDetectedObjects(predictions);

    // Run detection every 100ms for better performance
    setTimeout(() => this.detectObjects(), this.detectInterval);
  }

  updateDetectedObjects(objects: any[]) {
    this.detectedObjects = objects;
    this.drawDetections();
  }

  drawDetections() {
    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.detectedObjects.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, [8]);
      ctx.clip();

      // Gradient border
      const borderGradient = ctx.createLinearGradient(x, y, x + width, y + height);
      borderGradient.addColorStop(0, 'rgba(0, 255, 100, 0.6)');
      borderGradient.addColorStop(1, 'rgba(0, 180, 255, 0.6)');

      ctx.strokeStyle = borderGradient;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      // Subtle shadow effect
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 10;

      ctx.restore();

      const text = `${prediction.class} (${Math.round(prediction.score * 100)}%)`;
      ctx.font = '12px Inter, sans-serif';

      const textWidth = ctx.measureText(text).width;
      const labelHeight = 24;

      const labelGradient = ctx.createLinearGradient(x, y - labelHeight, x + textWidth + 20, y);
      labelGradient.addColorStop(0, 'rgba(0, 255, 100, 0.7)');
      labelGradient.addColorStop(1, 'rgba(0, 180, 255, 0.7)');

      ctx.fillStyle = labelGradient;
      ctx.beginPath();
      ctx.roundRect(x, y - labelHeight, textWidth + 20, labelHeight, [4, 4, 0, 0]); // Rounded top corners
      ctx.fill();

      ctx.fillStyle = 'white';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x + 10, y - labelHeight / 2);
    });
  }
}
