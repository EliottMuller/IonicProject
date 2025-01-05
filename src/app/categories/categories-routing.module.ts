import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoriesPage } from './categories.page';
import {CategoryService} from "../services/category.service";
import {SignService} from "../services/sign.service";

const routes: Routes = [
  {
    path: '',
    component: CategoriesPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    SignService,
    CategoryService
  ],
})
export class CategoriesPageRoutingModule {}
