import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarAtencionPage } from './editar-atencion.page';

describe('EditarAtencionPage', () => {
  let component: EditarAtencionPage;
  let fixture: ComponentFixture<EditarAtencionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarAtencionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
