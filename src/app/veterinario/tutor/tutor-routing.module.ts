import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TutorPage } from './tutor.page';

const routes: Routes = [
  {
    path: '',
    component: TutorPage
  },
  {
    path: 'agregar-tutor',
    loadChildren: () => import('./agregar-tutor/agregar-tutor.module').then( m => m.AgregarTutorPageModule)
  },
  {
    path: 'editar-tutor',
    loadChildren: () => import('./editar-tutor/editar-tutor.module').then( m => m.EditarTutorPageModule)
  },
  {
    path: 'mascotas',
    loadChildren: () => import('./mascotas/mascotas.module').then( m => m.MascotasPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TutorPageRoutingModule {}
