import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NuevacuentaPageRoutingModule } from './nuevacuenta-routing.module';

import { NuevacuentaPage } from './nuevacuenta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NuevacuentaPageRoutingModule
  ]
})
export class NuevacuentaPageModule {}
