import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgregarRecetaPageRoutingModule } from './agregar-receta-routing.module';

import { AgregarRecetaPage } from './agregar-receta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgregarRecetaPageRoutingModule
  ]
})
export class AgregarRecetaPageModule {}
