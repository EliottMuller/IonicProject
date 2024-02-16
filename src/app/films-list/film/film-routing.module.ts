import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {FilmPage} from './film.page';

const routes: Routes = [
  {
    path: '',
    component: FilmPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FilmPageRoutingModule {
}
