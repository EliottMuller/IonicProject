import {Injectable} from "@angular/core";
import {AngularFireStorage} from "@angular/fire/compat/storage";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {BehaviorSubject, map, Observable, tap} from "rxjs";
import {Categorie} from "../models/categorie.model";

@Injectable()
export class CategoryService {
  constructor(private _db:AngularFirestore,
              private _storage:AngularFireStorage
  ) {

  }

  private _categories$ = new BehaviorSubject<Categorie[]>([]);
  get categories$():Observable<Categorie[]>{
    return this._categories$.asObservable();
  }

  getCategoriesFromFirebase():void {
    this._db
      .collection('categorie')
      .snapshotChanges(['added'])
      .pipe(
        map((actions:any)=> actions.map((a:any) => {
          const data:any= a.payload.doc.data();
          return {...data};
        })),
        tap((categories:Categorie[]) =>{
          const categoriesWithUrl=this.getCategoriesWithUrl(categories);
          this._categories$.next(categoriesWithUrl)
        })
      ).subscribe()
  }

  getCategoriesWithUrl(categories:Categorie[]):Categorie[]{
    const categoriesWithUrl:Categorie[]=[]
    categories.forEach((c:Categorie)=>{
      this._storage.ref(c.image_categ).getDownloadURL().subscribe(
        (url:string)=>{
          categoriesWithUrl.push(
            {
              id_categ:c.id_categ,
              nom_categ:c.nom_categ,
              image_categ:url
            }
          )
        }
      )
    })
    return categoriesWithUrl
  }

}
