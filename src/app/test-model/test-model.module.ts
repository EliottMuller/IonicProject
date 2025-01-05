import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TestModelPageRoutingModule } from './test-model-routing.module';

import { TestModelPage } from './test-model.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TestModelPageRoutingModule
  ],
  declarations: [TestModelPage]
})
export class TestModelPageModule {}
