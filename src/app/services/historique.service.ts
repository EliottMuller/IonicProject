import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {
  FileOpener,
  FileOpenerOptions,
} from '@capacitor-community/file-opener';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Toast } from '@capacitor/toast';
import jsPDF from 'jspdf';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { Historique } from '../models/historique.model';

@Injectable()
export class HistoriqueService {
  constructor(
    private _db: AngularFirestore,
    private _storage: AngularFireStorage
  ) {}

  private _history$ = new BehaviorSubject<Historique[]>([]);
  get history$(): Observable<Historique[]> {
    return this._history$.asObservable();
  }

  getHistoryFromFirebase(): void {
    this._db
      .collection('history')
      .snapshotChanges(['added'])
      .pipe(
        map((actions: any) =>
          actions.map((a: any) => {
            const data: any = a.payload.doc.data();
            return { ...data };
          })
        ),
        tap((history: Historique[]) => {
          const historiqueWithUrl = this.getHistoryWithUrl(history);
          this._history$.next(historiqueWithUrl);
        })
      )
      .subscribe();
  }

  getHistoryWithUrl(history: Historique[]): Historique[] {
    const historyWithUrl: Historique[] = [];
    history.forEach((h: Historique) => {
      this._storage
        .ref(h.image)
        .getDownloadURL()
        .subscribe((url: string) => {
          historyWithUrl.push({
            image: url,
            nom: h.nom,
            score: h.score,
          });
        });
    });
    return historyWithUrl;
  }

  public async createPDF(history: Historique[]): Promise<void> {
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text('Historique des Objets Détectés', 10, 10);

    let yOffset = 20;
    for (const item of history) {
      var image = new Image();
      image.src = item.image;
      pdf.addImage(image, 'JPEG', 10, yOffset, 50, 50);
      pdf.setFontSize(12);
      pdf.text(`${history.indexOf(item) + 1}. Nom : ${item.nom}`, 60, yOffset);
      pdf.text(`  Score : ${item.score}%`, 60, yOffset + 10);
      yOffset += 60;
    }
    const pdfBase64 = pdf.output('datauristring').split(',')[1];

    await Toast.show({
      text: 'Téléchargement du fichier en cours...',
      duration: 'short',
    });

    const fileResult = await Filesystem.writeFile({
      path: 'historique.pdf',
      data: pdfBase64,
      directory: Directory.Documents,
    });

    await this.openDownloadedPDF(fileResult.uri);
  }

  private async openDownloadedPDF(fileUri: string): Promise<void> {
    const fileOpenerOptions: FileOpenerOptions = {
      filePath: fileUri,
      contentType: 'application/pdf',
      openWithDefault: true,
    };
    await FileOpener.open(fileOpenerOptions);
  }
  private async getBlobFromLocalUrl(localUrl: string): Promise<Blob> {
    const response = await fetch(localUrl);
    const blob = await response.blob();
    return blob;
  }

  private async uploadToFirebaseStorage(
    blob: Blob,
    fileName: string
  ): Promise<string> {
    const filePath = `Signs/${fileName}`;
    const fileRef = this._storage.ref(filePath);
    const snapshot = await fileRef.put(blob);
    const downloadUrl = await snapshot.ref.getDownloadURL();
    return downloadUrl;
  }
  private async uploadLocalFileToFirebase(localUrl: string): Promise<string> {
    const blob = await this.getBlobFromLocalUrl(localUrl);

    const fileName = `image_${Date.now()}.jpeg`; // Nom du fichier crée dans Firebase
    await this.uploadToFirebaseStorage(blob, fileName);

    return fileName;
  }

  public addToHistory(prediction: Historique): void {
    this.uploadLocalFileToFirebase(prediction.image).then(
      (fileName: string) => {
        this._db.collection('history').add({
          image: 'Signs/' + fileName,
          score: Math.round(prediction.score * 100),
          nom: prediction.nom,
        });
      }
    );
  }
}
