import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  IonAlert,
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/angular';
import { CounterService } from '../services/counter.service';

type SortMode = 'newest' | 'name' | 'value';

// Vyhľadávanie bez ohľadu na veľkosť písmen a diakritiku
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    DatePipe,
    IonAlert,
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonSpinner,
    IonTitle,
    IonToast,
    IonToolbar,
  ],
})
export class Tab2Page implements OnInit {
  readonly counterService = inject(CounterService);

  readonly searchTerm = signal('');
  readonly sortMode = signal<SortMode>('newest');
  readonly clearAlertOpen = signal(false);
  readonly toastOpen = signal(false);
  readonly toastMessage = signal('');

  readonly clearAlertButtons = [
    { text: 'Zrušit', role: 'cancel' },
    { text: 'Vymazat', role: 'confirm' },
  ];

  // Súčet hodnôt všetkých uložených počítadiel
  readonly total = computed(() =>
    this.counterService.counters().reduce((sum, counter) => sum + counter.value, 0),
  );

  // Vyhľadávanie + radenie. Pri zmene dát alebo vstupu sa prepočíta automaticky.
  readonly visibleCounters = computed(() => {
    const term = normalize(this.searchTerm().trim());
    const filtered = this.counterService
      .counters()
      .filter((counter) => normalize(counter.name).includes(term));

    switch (this.sortMode()) {
      case 'name':
        return filtered.sort((a, b) => a.name.localeCompare(b.name, 'cs'));
      case 'value':
        return filtered.sort((a, b) => b.value - a.value);
      default:
        return filtered; // služba už drží najnovšie záznamy ako prvé
    }
  });

  async ngOnInit(): Promise<void> {
    await this.counterService.initialize();
  }

  onSearch(event: CustomEvent<{ value?: string | null }>): void {
    this.searchTerm.set(event.detail.value ?? '');
  }

  onSortChange(event: CustomEvent<{ value?: string | number | null }>): void {
    const value = event.detail.value;
    if (value === 'newest' || value === 'name' || value === 'value') {
      this.sortMode.set(value);
    }
  }

  async remove(id: string): Promise<void> {
    await this.counterService.remove(id);
    this.showToast('Záznam byl odstraněn.');
  }

  openClearAlert(): void {
    this.clearAlertOpen.set(true);
  }

  async onClearAlertDismiss(event: CustomEvent<{ role?: string }>): Promise<void> {
    this.clearAlertOpen.set(false);

    if (event.detail.role === 'confirm') {
      await this.counterService.clear();
      this.searchTerm.set('');
      this.showToast('Historie byla vymazána.');
    }
  }

  private showToast(message: string): void {
    this.toastMessage.set(message);
    this.toastOpen.set(true);
  }
}