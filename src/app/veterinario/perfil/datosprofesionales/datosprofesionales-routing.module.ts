import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DatosprofesionalesPage } from './datosprofesionales.page';

const routes: Routes = [
  {
    path: '',
    component: DatosprofesionalesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DatosprofesionalesPageRoutingModule {}
