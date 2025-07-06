import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OlvidopassPage } from './olvidopass.page';

const routes: Routes = [
  {
    path: '',
    component: OlvidopassPage
  },
  {
    path: 'nuevacontrasena',
    loadChildren: () => import('./nuevacontrasena/nuevacontrasena.module').then( m => m.NuevacontrasenaPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OlvidopassPageRoutingModule {}
