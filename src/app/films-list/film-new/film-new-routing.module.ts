import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {FilmNewPage} from './film-new.page';

const routes: Routes = [
  {
    path: '',
    component: FilmNewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FilmNewPageRoutingModule {
}
