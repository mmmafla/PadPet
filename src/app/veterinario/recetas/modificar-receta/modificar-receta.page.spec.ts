import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModificarRecetaPage } from './modificar-receta.page';

describe('ModificarRecetaPage', () => {
  let component: ModificarRecetaPage;
  let fixture: ComponentFixture<ModificarRecetaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModificarRecetaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
