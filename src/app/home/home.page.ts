import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import {
  AlertController,
  IonList,
  LoadingController,
  ModalController,
  Platform,
} from '@ionic/angular';

import { Share } from '@capacitor/share';

import { Photo } from '../interfaces/photo';

import { SimpleAlertService } from '../services/simple-alert.service';
import { PhotoService } from '../services/photo.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild(IonList, { static: false }) slidingList: IonList;

  photos: Photo[] = [];

  constructor(
    public photoService: PhotoService,
    public sanitizer: DomSanitizer,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private modalController: ModalController,
    private simpleAlertService: SimpleAlertService,
    private platform: Platform
  ) {}

  ngOnInit(): void {
    this.photoService.getPhotos().subscribe((photos) => (this.photos = photos));
  }

  async takePhoto(): Promise<void> {
    const loadingOverlay = await this.loadingController.create({
      message: 'Saving photo...',
    });
    loadingOverlay.present();

    try {
      const photoUri = await this.photoService.takePhoto();
      loadingOverlay.dismiss();
      if (this.platform.is('capacitor')) {
        const alert = await this.alertController.create({
          header: 'Nice one!',
          message: `You've taken your snap for today, would you also like to share it?`,
          buttons: [
            { text: 'No' },
            {
              text: 'Share',
              handler: () => {
                Share.share({
                  title: `Today's snap`,
                  text: `I'm taking a selfie every day with #Snapaday`,
                  url: photoUri,
                });
              },
            },
          ],
        });

        alert.present();
      } else {
        this.simpleAlertService.showAlert(
          'Nice one!',
          `You've taken your snap for today.`
        );
      }
    } catch (err) {
      loadingOverlay.dismiss();
      this.simpleAlertService.showAlert(
        'Oops!',
        'Your photo could not be added, please try again.'
      );
      console.warn(err);
    }
  }

  async playSlideshow(): Promise<void> {}

  async deletePhoto(photo: Photo): Promise<void> {
    await this.slidingList.closeSlidingItems();
    this.photoService.deletePhoto(photo);
  }
}
