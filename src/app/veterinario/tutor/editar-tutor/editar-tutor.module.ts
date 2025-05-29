import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditarTutorPageRoutingModule } from './editar-tutor-routing.module';

import { EditarTutorPage } from './editar-tutor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditarTutorPageRoutingModule
  ]
})
export class EditarTutorPageModule {}
