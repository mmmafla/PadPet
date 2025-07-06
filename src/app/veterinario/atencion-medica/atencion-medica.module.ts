import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AtencionMedicaPageRoutingModule } from './atencion-medica-routing.module';

import { AtencionMedicaPage } from './atencion-medica.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AtencionMedicaPageRoutingModule
  ]
})
export class AtencionMedicaPageModule {}
