import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgregarRecetaPage } from './agregar-receta.page';

const routes: Routes = [
  {
    path: '',
    component: AgregarRecetaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgregarRecetaPageRoutingModule {}
