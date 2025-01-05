import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetectionPagePage } from './detection-page.page';

const routes: Routes = [
  {
    path: '',
    component: DetectionPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetectionPagePageRoutingModule {}
