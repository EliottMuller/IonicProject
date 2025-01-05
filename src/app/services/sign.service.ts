import {Injectable} from "@angular/core";
import {AngularFireStorage} from "@angular/fire/compat/storage";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {BehaviorSubject, map, Observable, tap} from "rxjs";
import {Sign} from "../models/sign.model";


@Injectable()
export class SignService {
  constructor(
    private _db:AngularFirestore,
    private _storage:AngularFireStorage
  ) {

  }

  private _signs$ = new BehaviorSubject<Sign[]>([])

  get signs$(): Observable<Sign[]>{
    return this._signs$.asObservable()
  }

  getSignsFromFirebase() {
    this._db.collection('signs').snapshotChanges(['added']).pipe(
      map((actions:any) => actions.map((a:any) => {
        const data:any= a.payload.doc.data();
        return {...data};
      })),
      tap((signs:Sign[]) => {
        const signsWithUrl = this.getSignsWithUrl(signs);
        this._signs$.next(signsWithUrl);

      })
    ).subscribe()
  }

  getSignsWithUrl(signs:Sign[]):Sign[]{
    const signsWithUrl:Sign[]=[]
    signs.forEach((s:Sign)=>{
      this._storage.ref(s.image).getDownloadURL().subscribe(
        (url:string)=>{
          signsWithUrl.push(
            {
              id:s.id,
              id_categorie:s.id_categorie,
              image:url,
              nom:s.nom
            }
          )
        }
      )
    })
    return signsWithUrl
  }

  getSignsByCategorieId(id_categ:string):Observable<Sign[]>{
    return this.signs$.pipe(
      map(signs=>signs.filter(sign=>sign.id_categorie===id_categ))
    )
  }

}
