import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {FilmNewPageRoutingModule} from './film-new-routing.module';

import {FilmNewPage} from './film-new.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FilmNewPageRoutingModule
  ],
  declarations: [FilmNewPage]
})
export class FilmNewPageModule {
}
