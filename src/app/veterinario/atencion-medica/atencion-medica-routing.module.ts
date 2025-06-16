import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AtencionMedicaPage } from './atencion-medica.page';

const routes: Routes = [
  {
    path: '',
    component: AtencionMedicaPage
  },
  {
    path: 'agregar-atencion-medica',
    loadChildren: () => import('./agregar-atencion-medica/agregar-atencion-medica.module').then( m => m.AgregarAtencionMedicaPageModule)
  },
  {
    path: 'detalle-atencion',
    loadChildren: () => import('./detalle-atencion/detalle-atencion.module').then( m => m.DetalleAtencionPageModule)
  },
  {
    path: 'editar-atencion',
    loadChildren: () => import('./editar-atencion/editar-atencion.module').then( m => m.EditarAtencionPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AtencionMedicaPageRoutingModule {}
