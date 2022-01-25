import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { SlideshowPage } from './../slideshow/slideshow.page';

import { DaysAgoPipe } from '../pipes/days-ago.pipe';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, HomePageRoutingModule],
  declarations: [HomePage, SlideshowPage, DaysAgoPipe],
})
export class HomePageModule {}
