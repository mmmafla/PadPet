import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NuevacontrasenaPage } from './nuevacontrasena.page';

const routes: Routes = [
  {
    path: '',
    component: NuevacontrasenaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NuevacontrasenaPageRoutingModule {}
