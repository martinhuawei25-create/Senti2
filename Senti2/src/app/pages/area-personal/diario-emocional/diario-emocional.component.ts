import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AreaPersonalDataService, DiaryEntry } from '../../../core/services/area-personal-data.service';
import { NotificationService } from '../../../core/services/notification.service';

const EMOCIONES = ['Calma', 'Alegría', 'Tristeza', 'Ansiedad', 'Cansancio', 'Enfado', 'Esperanza', 'Miedo', 'Gratitud', 'Preocupación'];

@Component({
  selector: 'app-diario-emocional',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './diario-emocional.component.html',
  styleUrls: ['./diario-emocional.component.css']
})
export class DiarioEmocionalComponent implements OnInit {
  emociones = EMOCIONES;
  entries: DiaryEntry[] = [];
  mood = 5;
  selectedEmotions: Record<string, boolean> = {};
  note = '';
  todayStr = '';
  saved = false;
  saving = false;
  patternSummary: { avgMood7: number | null; topEmotions: { name: string; count: number }[] } = {
    avgMood7: null,
    topEmotions: []
  };

  constructor(
    private areaData: AreaPersonalDataService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.todayStr = this.getTodayStr();
    EMOCIONES.forEach(e => (this.selectedEmotions[e] = false));
    void this.loadEntries();
  }

  private async loadEntries(): Promise<void> {
    this.entries = await this.areaData.getDiaryEntries();
    this.buildPatternSummary();
  }

  private getTodayStr(): string {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  toggleEmotion(emotion: string): void {
    this.selectedEmotions[emotion] = !this.selectedEmotions[emotion];
  }

  getSelectedEmotions(): string[] {
    return this.emociones.filter(e => this.selectedEmotions[e]);
  }

  async save(): Promise<void> {
    if (this.saving) return;
    this.saving = true;
    try {
      const emotions = this.getSelectedEmotions();
      await this.areaData.addDiaryEntry({
        date: this.todayStr,
        mood: this.mood,
        emotions,
        note: (this.note || '').trim()
      });
      await this.loadEntries();
      this.note = '';
      this.mood = 5;
      this.emociones.forEach(e => (this.selectedEmotions[e] = false));
      this.saved = true;
      setTimeout(() => (this.saved = false), 3000);
      this.notificationService.success('Entrada guardada correctamente.');
    } catch (_) {
      this.notificationService.error('No se pudo guardar la entrada. Inténtalo de nuevo.');
    } finally {
      this.saving = false;
    }
  }

  private buildPatternSummary(): void {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    let sum = 0;
    let count = 0;
    const emotionCount: Record<string, number> = {};
    for (const e of this.entries) {
      const d = new Date(e.date);
      if (d >= sevenDaysAgo) {
        sum += e.mood;
        count++;
      }
      for (const em of e.emotions) {
        emotionCount[em] = (emotionCount[em] ?? 0) + 1;
      }
    }
    this.patternSummary.avgMood7 = count > 0 ? Math.round((sum / count) * 10) / 10 : null;
    this.patternSummary.topEmotions = Object.entries(emotionCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

}
