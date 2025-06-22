import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgregarTutorPage } from './agregar-tutor.page';

const routes: Routes = [
  {
    path: '',
    component: AgregarTutorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgregarTutorPageRoutingModule {}
