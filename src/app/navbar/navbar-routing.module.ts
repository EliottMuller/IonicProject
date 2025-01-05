import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NavbarPage } from './navbar.page';

const routes: Routes = [
  {
    path: '',
    component: NavbarPage,
    children: [
      {
        path: 'home',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../categories/categories.module').then(m => m.HomePageModule)
          }
        ]
      },
      {
        path: 'historique',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../historique/historique.module').then(m => m.HistoriquePageModule)
          }
        ]
      },
      {
        path: 'detection-page',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../detection-page/detection-page.module').then(m => m.DetectionPagePageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NavbarPageRoutingModule {}
