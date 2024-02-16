import {Component, OnInit} from '@angular/core';
import {Film} from '../models/film.model';
import {FilmService} from '../film.service';

@Component({
  selector: 'app-films-list',
  templateUrl: './films-list.page.html',
  styleUrls: ['./films-list.page.scss'],
})
export class FilmsListPage implements OnInit {
  films!: Array<Film>;

  constructor(
    private Film: FilmService
  ) {
  }

  ngOnInit() {
    this.Film.getAll().subscribe((data: any) => {
      this.films = data;
    });
  }

}
