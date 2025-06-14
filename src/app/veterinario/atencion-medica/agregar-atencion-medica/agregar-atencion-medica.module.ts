import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgregarAtencionMedicaPageRoutingModule } from './agregar-atencion-medica-routing.module';

import { AgregarAtencionMedicaPage } from './agregar-atencion-medica.page';
import { ModalFechaComponent } from 'src/app/modal-fecha/modal-fecha.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgregarAtencionMedicaPageRoutingModule,
    ModalFechaComponent
  ]
})
export class AgregarAtencionMedicaPageModule {}
