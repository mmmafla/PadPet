import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleCitaPageRoutingModule } from './detalle-cita-routing.module';

import { DetalleCitaPage } from './detalle-cita.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleCitaPageRoutingModule
  ]
})
export class DetalleCitaPageModule {}
