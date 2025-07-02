import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModificarRecetaPage } from './modificar-receta.page';

const routes: Routes = [
  {
    path: '',
    component: ModificarRecetaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModificarRecetaPageRoutingModule {}
