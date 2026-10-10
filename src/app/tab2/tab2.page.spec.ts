import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Preferences } from '@capacitor/preferences';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SavedCounter } from '../models/saved-counter';
import { Tab2Page } from './tab2.page';

vi.mock('@capacitor/preferences', () => ({
  Preferences: { get: vi.fn(), set: vi.fn(), remove: vi.fn() },
}));

describe('Tab2Page', () => {
  let component: Tab2Page;
  let fixture: ComponentFixture<Tab2Page>;

  const alpha: SavedCounter = {
    id: 'a',
    name: 'Návštěvníci',
    value: 5,
    createdAt: '2026-09-17T08:00:00.000Z',
  };
  const beta: SavedCounter = {
    id: 'b',
    name: 'Auta',
    value: 2,
    createdAt: '2026-09-17T09:00:00.000Z',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(Preferences.get).mockResolvedValue({
      value: JSON.stringify([alpha, beta]),
    });
    vi.mocked(Preferences.set).mockResolvedValue(undefined);
    vi.mocked(Preferences.remove).mockResolvedValue(undefined);

    fixture = TestBed.createComponent(Tab2Page);
    component = fixture.componentInstance;
    await component.counterService.initialize();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute the total of all counters', () => {
    expect(component.total()).toBe(7);
  });

  it('should search by name ignoring diacritics', () => {
    component.searchTerm.set('navstevnici');

    expect(component.visibleCounters().map((c) => c.id)).toEqual(['a']);
  });

  it('should sort by value descending and by name ascending', () => {
    component.sortMode.set('value');
    expect(component.visibleCounters().map((c) => c.id)).toEqual(['a', 'b']);

    component.sortMode.set('name');
    expect(component.visibleCounters().map((c) => c.id)).toEqual(['b', 'a']);
  });

    it('should compute the minimum and maximum of all counters', () => {
    expect(component.minimum()).toBe(2);
    expect(component.maximum()).toBe(5);
  });

});