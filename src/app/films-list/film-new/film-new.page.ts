import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ToastController} from '@ionic/angular';
import {FilmService} from 'src/app/film.service';
import {Film} from 'src/app/models/film.model';

@Component({
  selector: 'app-film-new',
  templateUrl: './film-new.page.html',
  styleUrls: ['./film-new.page.scss'],
})
export class FilmNewPage implements OnInit {
  public film!: Film;

  constructor(
    private Film: FilmService,
    private toastCtrl: ToastController,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.film = new Film();
  }

  async presentToast() {
    const toast = this.toastCtrl.create({
      message: 'Nouveau Film enregistré',
      duration: 2000
    });
    (await toast).present().then(() => {
      setTimeout(() => {
        this.router.navigate(['/films']);
      }, 2000);
    });
  }

  add() {
    this.Film.saveNewFilm(this.film).subscribe(() => {
      this.film = new Film();
      this.presentToast();
    });
  }
}
