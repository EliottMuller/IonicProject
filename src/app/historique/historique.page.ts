import { Component, OnInit } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Historique } from '../models/historique.model';
import { HistoriqueService } from '../services/historique.service';

@Component({
  selector: 'app-historique',
  templateUrl: './historique.page.html',
  styleUrls: ['./historique.page.scss'],
})
export class HistoriquePage implements OnInit {
  historique$!: Observable<Historique[]>;
  constructor(private historiqueService: HistoriqueService) {}

  ngOnInit() {
    this.historiqueService.getHistoryFromFirebase();
    this.historique$ = this.historiqueService.history$;
  }

  getBadgeColor(percentage: number): string {
    if (percentage > 75) return 'success';
    else if (percentage > 25) return 'warning';
    else return 'danger';
  }

  genererPDF(): void {
    this.historique$
      .pipe(
        tap((history) => {
          this.historiqueService.createPDF(history);
        })
      )
      .subscribe();
  }
}
