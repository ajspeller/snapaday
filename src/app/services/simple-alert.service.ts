import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class SimpleAlertService {
  constructor(private alertController: AlertController) {}

  async showAlert(title: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: title,
      message,
      buttons: [{ text: 'Ok' }],
    });

    await alert.present();
  }
}
