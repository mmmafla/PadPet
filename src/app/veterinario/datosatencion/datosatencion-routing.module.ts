import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DatosatencionPage } from './datosatencion.page';

const routes: Routes = [
  {
    path: '',
    component: DatosatencionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DatosatencionPageRoutingModule {}
