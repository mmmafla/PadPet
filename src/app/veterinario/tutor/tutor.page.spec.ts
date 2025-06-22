import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TutorPage } from './tutor.page';

describe('TutorPage', () => {
  let component: TutorPage;
  let fixture: ComponentFixture<TutorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TutorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
