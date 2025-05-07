import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NuevacuentaPageRoutingModule } from './nuevacuenta-routing.module';

import { NuevacuentaPage } from './nuevacuenta.page';
import { ReactiveFormsModule } from '@angular/forms';
import { FormularioComponent } from 'src/app/componentes/formulario/formulario.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NuevacuentaPageRoutingModule,
    ReactiveFormsModule,
    FormularioComponent,

  ]

})
export class NuevacuentaPageModule {}
