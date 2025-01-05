import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
 {
  path: 'navbar',
  loadChildren: () => import('./navbar/navbar.module').then( m => m.NavbarPageModule)
 },
  {
    path: 'detection',
    loadChildren: () => import('./detection/detection.module').then(m => m.DetectionPageModule)
  },
  {
    path: '',
    redirectTo: 'navbar',
    pathMatch: 'full',
  },
  {
    path: 'detection-page',
    loadChildren: () => import('./detection-page/detection-page.module').then(m => m.DetectionPagePageModule)
  },
  {
    path: 'detection-image',
    loadChildren: () => import('./detection-image/detection-image.module').then( m => m.DetectionImagePageModule)
  },
  {
    path: 'training',
    loadChildren: () => import('./training/training.module').then( m => m.TrainingPageModule)
  },
  {
    path: 'test-model',
    loadChildren: () => import('./test-model/test-model.module').then( m => m.TestModelPageModule)
  },
  {
    path: 'categories',
    loadChildren: () => import('./categories/categories.module').then( m => m.HomePageModule)
  }





];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
