import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalleCitaPage } from './detalle-cita.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleCitaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleCitaPageRoutingModule {}
