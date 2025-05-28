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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TutorPageRoutingModule {}
