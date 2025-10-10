import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieComingsoon } from './movie-comingsoon';

describe('MovieComingsoon', () => {
  let component: MovieComingsoon;
  let fixture: ComponentFixture<MovieComingsoon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieComingsoon]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovieComingsoon);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
