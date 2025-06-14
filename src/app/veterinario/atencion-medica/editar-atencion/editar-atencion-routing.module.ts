import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditarAtencionPage } from './editar-atencion.page';

const routes: Routes = [
  {
    path: '',
    component: EditarAtencionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditarAtencionPageRoutingModule {}
