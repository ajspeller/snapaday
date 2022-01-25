import { Injectable } from '@angular/core';

import {
  Camera,
  CameraResultType,
  CameraSource,
  ImageOptions,
  Photo,
} from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import {
  ReadFileResult,
  Filesystem,
  Directory,
  WriteFileResult,
} from '@capacitor/filesystem';

import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

import { BehaviorSubject, Observable } from 'rxjs';

import { Photo as SnapadayPhoto } from '../interfaces/photo';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  photoAlreadyTakenToday = false;
  private photos$ = new BehaviorSubject<SnapadayPhoto[]>([]);
  private photos: SnapadayPhoto[] = [];
  private loaded = false;

  constructor(private storage: Storage, private platform: Platform) {}

  async load(): Promise<void> {
    // test data
    this.photos = [
      {
        name: 'test',
        path: 'http://placehold.it/100x100',
        dateTaken: new Date(2018, 5, 5),
      },
      {
        name: 'test',
        path: 'http://placehold.it/100x100',
        dateTaken: new Date(2018, 5, 6),
      },
      {
        name: 'test',
        path: 'http://placehold.it/100x100',
        dateTaken: new Date(2018, 5, 8),
      },
      {
        name: 'test',
        path: 'http://placehold.it/100x100',
        dateTaken: new Date(2018, 5, 10),
      },
    ];

    this.checkIfPhotoAlreadyTakenToday();
    this.photos$.next(this.photos);

    this.addPhotoTakenListener();
  }

  getPhotos(): Observable<SnapadayPhoto[]> {
    return this.photos$;
  }

  checkIfPhotoAlreadyTakenToday(): void {
    if (this.photos.length) {
      const today = new Date();
      const latestPhotoDate = new Date(this.photos[0].dateTaken);

      if (latestPhotoDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)) {
        this.photoAlreadyTakenToday = true;
      } else {
        this.photoAlreadyTakenToday = false;
      }
    } else {
      this.photoAlreadyTakenToday = false;
    }
  }

  addPhotoTakenListener(): void {
    // we need to listen for the 'resume' event in case the user
    // has the app running for more than a full day in the background
    this.platform.resume.subscribe(() => this.checkIfPhotoAlreadyTakenToday());
  }

  async takePhoto(): Promise<string> {
    if (!this.loaded || this.photoAlreadyTakenToday) {
      throw new Error('Not allowed to take photo');
    }

    const options: ImageOptions = {
      quality: 50,
      width: 600,
      allowEditing: false,
      resultType: this.platform.is('capacitor')
        ? CameraResultType.Uri
        : CameraResultType.DataUrl,
      source: CameraSource.Camera,
    };

    try {
      const photo: Photo = await Camera.getPhoto(options);
      console.log(photo);
      if (this.platform.is('capacitor')) {
        const photoOnFileSystem: ReadFileResult = await Filesystem.readFile({
          path: photo.path,
        });
        const fileName = `${Date.now().toString()}.jpeg`;
        const permanentFile: WriteFileResult = await Filesystem.writeFile({
          data: photoOnFileSystem.data,
          path: fileName,
          directory: Directory.Data,
        });
        this.createPhoto(fileName, Capacitor.convertFileSrc(permanentFile.uri));
        this.photoAlreadyTakenToday = true;
        return photo.path;
      } else {
        this.createPhoto(Date.now().toString(), photo.dataUrl);
        this.photoAlreadyTakenToday = true;
        return photo.dataUrl;
      }
    } catch (err) {
      throw new Error('Count not write file');
    }
  }

  createPhoto(fileName: string, filePath: string): void {
    const newPhotos = [
      { name: fileName, path: filePath, dateTaken: new Date() },
      ...this.photos,
    ];

    this.photos = newPhotos;
    this.save();
  }

  async deletePhoto(photoToDelete: SnapadayPhoto): Promise<void> {
    // remove data from storage
    this.photos = this.photos.filter(
      (photo) => photo.name !== photoToDelete.name
    );
    this.save();

    // if the deleted photo was taken today, allow the user to take a new photo
    const today = new Date();
    const dateTaken = new Date(photoToDelete.dateTaken);
    if (dateTaken.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)) {
      this.photoAlreadyTakenToday = false;
    }
    if (this.platform.is('capacitor')) {
      await Filesystem.deleteFile({
        path: photoToDelete.name,
        directory: Directory.Data,
      });
    }
  }

  save(): Promise<void> {
    this.photos$.next(this.photos);
    return Promise.resolve();
  }
}
