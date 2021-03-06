import { Component } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
import { LocalNotifications } from '@capacitor/local-notifications';

import { Storage } from '@ionic/storage-angular';
import { PhotoService } from './services/photo.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private storage: Storage, private photoService: PhotoService) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.storage.create();
    await this.photoService.load();
    SplashScreen.hide().catch((err) => console.warn(err));
    StatusBar.setBackgroundColor({ color: '#eb445a' }).catch((err) =>
      console.warn(err)
    );
    const pendingNotifications = await LocalNotifications.getPending();
    if (pendingNotifications.notifications.length === 0) {
      const firstNotificationTime = new Date();
      firstNotificationTime.setHours(firstNotificationTime.getHours() + 24);
      LocalNotifications.schedule({
        notifications: [
          {
            id: 1,
            title: 'Snapaday',
            body: 'Have you taken your snap today',
            schedule: { at: firstNotificationTime, every: 'day' },
          },
        ],
      });
    }
  }
}
