import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgregarAtencionMedicaPageRoutingModule } from './agregar-atencion-medica-routing.module';

import { AgregarAtencionMedicaPage } from './agregar-atencion-medica.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgregarAtencionMedicaPageRoutingModule
  ]
})
export class AgregarAtencionMedicaPageModule {}
