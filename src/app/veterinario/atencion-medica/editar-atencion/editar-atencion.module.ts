import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditarAtencionPageRoutingModule } from './editar-atencion-routing.module';

import { EditarAtencionPage } from './editar-atencion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditarAtencionPageRoutingModule
  ]
})
export class EditarAtencionPageModule {}
