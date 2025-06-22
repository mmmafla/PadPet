import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgregarMascotaPageRoutingModule } from './agregar-mascota-routing.module';

import { AgregarMascotaPage } from './agregar-mascota.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgregarMascotaPageRoutingModule
  ],
})
export class AgregarMascotaPageModule {}
