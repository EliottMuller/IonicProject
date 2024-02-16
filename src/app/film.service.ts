import {Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import {Film} from './models/film.model';

@Injectable({
  providedIn: 'root'
})
export class FilmService {
  private dbPath = '/films';
  filmsRef: AngularFirestoreCollection<Film>;


  constructor(
    private db: AngularFirestore
  ) {
    this.filmsRef = db.collection(this.dbPath);
  }

  getAll(): any {
    return this.filmsRef.snapshotChanges().pipe(
      map((changes: any) => {
        return changes.map((doc: any) => {
          return ({id: doc.payload.doc.id, ...doc.payload.doc.data()})
        })
      })
    );
  }

  saveNewFilm(film: Film): any {
    return new Observable(obs => {
      this.filmsRef.add({...film}).then(() => {
        obs.next();
      });
    });
  }

  get(id: any): any {
    return new Observable(obs => {
      this.filmsRef.doc(id).get().subscribe(res => {
        obs.next({id: res.id, ...res.data()});
      });
    });
  }

  update(film: Film) {
    return new Observable(obs => {
      this.filmsRef.doc(film.id).update(film);
      obs.next();
    });
  }

  delete(id: any) {
    this.db.doc(`films/${id}`).delete();
  }
}
