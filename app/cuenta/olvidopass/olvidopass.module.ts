import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OlvidopassPageRoutingModule } from './olvidopass-routing.module';

import { OlvidopassPage } from './olvidopass.page';
import { FormularioComponent } from 'src/app/componentes/formulario/formulario.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OlvidopassPageRoutingModule,
    ReactiveFormsModule,
    FormularioComponent,
  ]
})
export class OlvidopassPageModule {}
