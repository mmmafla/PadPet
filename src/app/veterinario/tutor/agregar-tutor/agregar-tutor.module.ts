import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgregarTutorPageRoutingModule } from './agregar-tutor-routing.module';

import { AgregarTutorPage } from './agregar-tutor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgregarTutorPageRoutingModule
  ],
})
export class AgregarTutorPageModule {}
