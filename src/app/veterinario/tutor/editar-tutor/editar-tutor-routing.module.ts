import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditarTutorPage } from './editar-tutor.page';

const routes: Routes = [
  {
    path: '',
    component: EditarTutorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditarTutorPageRoutingModule {}
