import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MascotasPage } from './mascotas.page';

const routes: Routes = [
  {
    path: '',
    component: MascotasPage
  },
  {
    path: 'agregar-mascota',
    loadChildren: () => import('./agregar-mascota/agregar-mascota.module').then( m => m.AgregarMascotaPageModule)
  },  {
    path: 'editar-mascota',
    loadChildren: () => import('./editar-mascota/editar-mascota.module').then( m => m.EditarMascotaPageModule)
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MascotasPageRoutingModule {}
