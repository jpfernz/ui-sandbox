import '@angular/compiler';
import '@analogjs/vitest-angular/setup-zone';

import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { getTestBed } from '@angular/core/testing';

// Mock the @angular/animations module
vi.mock('@angular/animations', () => ({
  trigger: vi.fn(),
  state: vi.fn(),
  style: vi.fn(),
  transition: vi.fn(),
  animate: vi.fn(),
  keyframes: vi.fn(),
  query: vi.fn(),
  stagger: vi.fn(),
  group: vi.fn(),
  sequence: vi.fn(),
  animation: vi.fn(),
  useAnimation: vi.fn(),
  AnimationBuilder: vi.fn(),
  AnimationFactory: vi.fn(),
  NoopAnimationPlayer: vi.fn(),
  AnimationPlayer: vi.fn(),
}));

// Mock the @angular/platform-browser/animations module
vi.mock('@angular/platform-browser/animations', () => ({
  BrowserAnimationsModule: {
    providers: [],
  },
  NoopAnimationsModule: {
    providers: [],
  },
  provideAnimations: vi.fn(),
  provideNoopAnimations: vi.fn(),
}));

getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting()
);
