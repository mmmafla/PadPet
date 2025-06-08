import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditarMascotaPageRoutingModule } from './editar-mascota-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditarMascotaPageRoutingModule
  ],
})
export class EditarMascotaPageModule {}
