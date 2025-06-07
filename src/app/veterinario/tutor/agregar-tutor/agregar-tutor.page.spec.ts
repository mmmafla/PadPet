import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarTutorPage } from './agregar-tutor.page';

describe('AgregarTutorPage', () => {
  let component: AgregarTutorPage;
  let fixture: ComponentFixture<AgregarTutorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarTutorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
