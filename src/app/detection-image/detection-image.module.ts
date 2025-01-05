import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetectionImagePageRoutingModule } from './detection-image-routing.module';

import { DetectionImagePage } from './detection-image.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetectionImagePageRoutingModule
  ],
  declarations: [DetectionImagePage]
})
export class DetectionImagePageModule {}
