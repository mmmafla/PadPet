import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleAtencionPageRoutingModule } from './detalle-atencion-routing.module';

import { DetalleAtencionPage } from './detalle-atencion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleAtencionPageRoutingModule
  ]
})
export class DetalleAtencionPageModule {}
