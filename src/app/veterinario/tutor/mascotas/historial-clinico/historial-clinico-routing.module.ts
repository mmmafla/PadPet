import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HistorialClinicoPage } from './historial-clinico.page';

const routes: Routes = [
  {
    path: '',
    component: HistorialClinicoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HistorialClinicoPageRoutingModule {}
