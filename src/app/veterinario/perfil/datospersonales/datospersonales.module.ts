import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DatospersonalesPageRoutingModule } from './datospersonales-routing.module';

import { DatospersonalesPage } from './datospersonales.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DatospersonalesPageRoutingModule
  ],

})
export class DatospersonalesPageModule {}
