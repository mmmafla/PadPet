import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NuevacontrasenaPage } from './nuevacontrasena.page';

describe('NuevacontrasenaPage', () => {
  let component: NuevacontrasenaPage;
  let fixture: ComponentFixture<NuevacontrasenaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NuevacontrasenaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
