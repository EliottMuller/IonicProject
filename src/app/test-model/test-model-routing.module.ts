import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TestModelPage } from './test-model.page';

const routes: Routes = [
  {
    path: '',
    component: TestModelPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TestModelPageRoutingModule {}
