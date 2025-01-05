import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HistoriquePage } from './historique.page';
import {HistoriqueService} from "../services/historique.service";

const routes: Routes = [
  {
    path: '',
    component: HistoriquePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    HistoriqueService
  ]
})
export class HistoriquePageRoutingModule {}
