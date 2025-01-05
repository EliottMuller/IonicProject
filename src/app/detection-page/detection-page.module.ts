import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetectionPagePageRoutingModule } from './detection-page-routing.module';

import { DetectionPagePage } from './detection-page.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetectionPagePageRoutingModule
  ],
  declarations: [DetectionPagePage]
})
export class DetectionPagePageModule {}
