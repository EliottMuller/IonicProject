import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LoadingController } from '@ionic/angular';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

@Component({
  selector: 'app-detection-page',
  templateUrl: './detection-page.page.html',
  styleUrls: ['./detection-page.page.scss'],
})
export class DetectionPagePage {
  isLoading = false;

  constructor(
    private router: Router,
    private loadingController: LoadingController
  ) {}

  async importImage() {
    try {
      const image = await Camera.getPhoto({
        quality: 75,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
        saveToGallery: false,
      });

      if (image.webPath) {
        await this.detectObjects(image.webPath);
      }
    } catch (error) {
      console.error('Error capturing or selecting image:', error);
    }
  }

  async detectObjects(imageUri: string) {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Analyse en cours...',
    });
    await loading.present();

    const img = new Image();
    img.src = imageUri;

    img.onload = async () => {
      try {
        const startTime = performance.now();
        const model = await cocoSsd.load();
        const predictions = await model.detect(img);
        const endTime = performance.now();
        const detectionTime = Math.round(endTime - startTime);

        this.router.navigate(['/detection-image'], {
          state: {
            image: imageUri,
            predictions: predictions,
            detectionTime: detectionTime,
          },
        });
      } catch (error) {
        console.error('Error during model loading or detection:', error);
      } finally {
        this.isLoading = false;
        loading.dismiss();
      }
    };
  }
}
