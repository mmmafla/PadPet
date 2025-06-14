import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalleAtencionPage } from './detalle-atencion.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleAtencionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleAtencionPageRoutingModule {}
