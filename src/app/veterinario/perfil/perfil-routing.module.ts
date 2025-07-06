import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PerfilPage } from './perfil.page';

const routes: Routes = [
  {
    path: '',
    component: PerfilPage
  },
  {
    path: 'datospersonales',
    loadChildren: () => import('./datospersonales/datospersonales.module').then( m => m.DatospersonalesPageModule)
  },
  {
    path: 'datosprofesionales',
    loadChildren: () => import('./datosprofesionales/datosprofesionales.module').then( m => m.DatosprofesionalesPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerfilPageRoutingModule {}
