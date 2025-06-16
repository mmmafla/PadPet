import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistorialClinicoPageRoutingModule } from './historial-clinico-routing.module';

import { HistorialClinicoPage } from './historial-clinico.page';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistorialClinicoPageRoutingModule
  ]
})
export class HistorialClinicoPageModule {}
