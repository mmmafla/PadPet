import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DatosprofesionalesPageRoutingModule } from './datosprofesionales-routing.module';

import { DatosprofesionalesPage } from './datosprofesionales.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DatosprofesionalesPageRoutingModule
  ]
})
export class DatosprofesionalesPageModule {}
