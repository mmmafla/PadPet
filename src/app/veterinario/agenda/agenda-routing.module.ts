import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgendaPage } from './agenda.page';

const routes: Routes = [
  {
    path: '',
    component: AgendaPage
  },
  {
    path: 'agregar-cita',
    loadChildren: () => import('./agregar-cita/agregar-cita.module').then( m => m.AgregarCitaPageModule)
  },
  {
    path: 'modificar-cita',
    loadChildren: () => import('./modificar-cita/modificar-cita.module').then( m => m.ModificarCitaPageModule)
  },
  {
    path: 'detalle-cita',
    loadChildren: () => import('./detalle-cita/detalle-cita.module').then( m => m.DetalleCitaPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgendaPageRoutingModule {}
