import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarTutorPage } from './editar-tutor.page';

describe('EditarTutorPage', () => {
  let component: EditarTutorPage;
  let fixture: ComponentFixture<EditarTutorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarTutorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
