import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModificarRecetaPageRoutingModule } from './modificar-receta-routing.module';

import { ModificarRecetaPage } from './modificar-receta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModificarRecetaPageRoutingModule
  ]
})
export class ModificarRecetaPageModule {}
