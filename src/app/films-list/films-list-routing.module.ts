import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {FilmsListPage} from './films-list.page';

const routes: Routes = [
  {
    path: '',
    component: FilmsListPage
  },
  {
    path: 'new',
    loadChildren: () => import('./film-new/film-new.module').then(m => m.FilmNewPageModule)
  },
  {
    path: ':id',
    loadChildren: () => import('./film/film.module').then(m => m.FilmPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FilmsListPageRoutingModule {
}
