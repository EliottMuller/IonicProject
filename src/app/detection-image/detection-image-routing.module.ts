import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetectionImagePage } from './detection-image.page';
import {HistoriqueService} from "../services/historique.service";

const routes: Routes = [
  {
    path: '',
    component: DetectionImagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    HistoriqueService
  ]
})
export class DetectionImagePageRoutingModule {}
