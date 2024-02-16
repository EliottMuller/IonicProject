import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertController, ToastController} from '@ionic/angular';
import {FilmService} from 'src/app/film.service';
import {Film} from 'src/app/models/film.model';

@Component({
  selector: 'app-film',
  templateUrl: './film.page.html',
  styleUrls: ['./film.page.scss'],
})
export class FilmPage implements OnInit {
  modif: boolean = false;
  film!: Film;

  constructor(
    private alertCtrl: AlertController,
    private route: ActivatedRoute,
    private Film: FilmService,
    private toastCtrl: ToastController,
    private router: Router
  ) {
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.Film.get(id).subscribe((value: any) => {
      this.film = value;
    });
  }

  async setModif() {
    if (!this.modif) {
      const alert = await this.alertCtrl.create({
        header: 'Etes vous sur de vouloir modifier ?',
        subHeader: 'Vous rendrez possible la modification',
        buttons: [
          {
            text: 'Annuler',
            role: 'Cancel'
          }, {
            text: 'Configurer',
            handler: () => {
              this.modif = !this.modif
            }
          }
        ]
      });
      await alert.present();
    } else {
      this.modif = !this.modif;
    }
  }

  async presentToast() {
    const toast = this.toastCtrl.create({
      message: 'Vos modifications sont enregistrées',
      duration: 2000
    });
    (await toast).present();
  }

  onModif() {
    this.Film.update(this.film).subscribe(() => {
      this.presentToast();
      this.modif = false;
    });
  }

  onDelete(id: any) {
    this.Film.delete(id);
    this.router.navigate(['/films']);
  }
}
