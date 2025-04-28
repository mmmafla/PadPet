import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NuevacuentaPage } from './nuevacuenta.page';

const routes: Routes = [
  {
    path: '',
    component: NuevacuentaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NuevacuentaPageRoutingModule {}
