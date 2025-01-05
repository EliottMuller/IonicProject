import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {Categorie} from "../models/categorie.model";
import {Sign} from "../models/sign.model";
import {SignService} from "../services/sign.service";
import {CategoryService} from "../services/category.service";

@Component({
  selector: 'app-categories',
  templateUrl: 'categories.page.html',
  styleUrls: ['categories.page.scss'],
})
export class CategoriesPage implements OnInit {
  categories$!:Observable<Categorie[]>;
  signs$!:Observable<Sign[]>;

  constructor(
    public signService:SignService,
    private categoryService:CategoryService
  ) {

  }
  ngOnInit():void {
    this.initObservables();
    this.categoryService.getCategoriesFromFirebase();
    this.signService.getSignsFromFirebase();
  }

  initObservables(){
    this.categories$=this.categoryService.categories$;
    this.signs$=this.signService.signs$;
  }
}
