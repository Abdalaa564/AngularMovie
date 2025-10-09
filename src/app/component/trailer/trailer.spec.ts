import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Trailer } from './trailer';

describe('Trailer', () => {
  let component: Trailer;
  let fixture: ComponentFixture<Trailer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Trailer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Trailer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
