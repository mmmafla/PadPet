import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgregarAtencionMedicaPage } from './agregar-atencion-medica.page';

const routes: Routes = [
  {
    path: '',
    component: AgregarAtencionMedicaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgregarAtencionMedicaPageRoutingModule {}
