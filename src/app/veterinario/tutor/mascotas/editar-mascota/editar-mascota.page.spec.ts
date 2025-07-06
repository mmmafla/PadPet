import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarMascotaPage } from './editar-mascota.page';

describe('EditarMascotaPage', () => {
  let component: EditarMascotaPage;
  let fixture: ComponentFixture<EditarMascotaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarMascotaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
