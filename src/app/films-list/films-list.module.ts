import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {FilmsListPageRoutingModule} from './films-list-routing.module';

import {FilmsListPage} from './films-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FilmsListPageRoutingModule
  ],
  declarations: [FilmsListPage]
})
export class FilmsListPageModule {
}
