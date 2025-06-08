import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditarMascotaPage } from './editar-mascota.page';

const routes: Routes = [
  {
    path: '',
    component: EditarMascotaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditarMascotaPageRoutingModule {}
