import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { ModalController } from '@ionic/angular';

import { take } from 'rxjs/operators';

import { Photo } from '../interfaces/photo';
import { PhotoService } from './../services/photo.service';
import { SimpleAlertService } from '../services/simple-alert.service';

@Component({
  selector: 'app-slideshow',
  templateUrl: './slideshow.page.html',
  styleUrls: ['./slideshow.page.scss'],
})
export class SlideshowPage implements OnInit, OnDestroy {
  imageSrc: SafeResourceUrl;
  private photos: Photo[];
  private slideshowInterval: ReturnType<typeof setInterval>;

  constructor(
    private modalController: ModalController,
    private photoService: PhotoService,
    private sanitizer: DomSanitizer,
    private simpleAlertService: SimpleAlertService
  ) {}

  ngOnDestroy(): void {
    clearInterval(this.slideshowInterval);
  }

  ngOnInit() {
    this.photoService
      .getPhotos()
      .pipe(take(1))
      .subscribe((photos) => {
        this.photos = photos;
        this.reset();
      });
  }

  playSlideshow(): void {
    let currentPhotoIndex = 1;

    clearInterval(this.slideshowInterval);

    this.slideshowInterval = setInterval(() => {
      if (currentPhotoIndex < this.photos.length) {
        this.imageSrc = this.sanitizer.bypassSecurityTrustUrl(
          this.photos[currentPhotoIndex].path
        );
        currentPhotoIndex++;
      } else {
        clearInterval(this.slideshowInterval);
      }
    }, 1000);
  }

  reset(): void {
    if (this.photos.length > 1) {
      this.imageSrc = this.sanitizer.bypassSecurityTrustUrl(
        this.photos[0].path
      );
      this.playSlideshow();
    } else {
      this.simpleAlertService.showAlert(
        'Oops!',
        'You need at least 2 photos to play the slideshow'
      );
    }
  }

  close(): void {
    this.modalController.dismiss();
  }
}
