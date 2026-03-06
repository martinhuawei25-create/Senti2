import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AreaPersonalDataService, TestResultRecord, DiaryEntry } from '../../../core/services/area-personal-data.service';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.css']
})
export class EstadisticasComponent implements OnInit {
  testResults: TestResultRecord[] = [];
  diaryEntries: DiaryEntry[] = [];
  lastByTest: Record<string, TestResultRecord> = {};
  loading = true;
  diaryStats: { avgMoodLast7: number | null; totalEntries: number; emotionsCount: Record<string, number> } = {
    avgMoodLast7: null,
    totalEntries: 0,
    emotionsCount: {}
  };

  constructor(private areaData: AreaPersonalDataService) {}

  ngOnInit(): void {
    void this.loadData();
  }

  private async loadData(): Promise<void> {
    this.loading = true;
    try {
      const [testResults, diaryEntries] = await Promise.all([
        this.areaData.getTestResults(),
        this.areaData.getDiaryEntries()
      ]);
      this.testResults = testResults;
      this.diaryEntries = diaryEntries;
      this.buildLastByTest();
      this.buildDiaryStats();
    } finally {
      this.loading = false;
    }
  }

  private buildLastByTest(): void {
    const byTest: Record<string, TestResultRecord> = {};
    for (const r of this.testResults) {
      if (!byTest[r.testId] || new Date(r.date) > new Date(byTest[r.testId].date)) {
        byTest[r.testId] = r;
      }
    }
    this.lastByTest = byTest;
  }

  private buildDiaryStats(): void {
    this.diaryStats.totalEntries = this.diaryEntries.length;
    const emotionsCount: Record<string, number> = {};
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    let sumMood = 0;
    let countMood = 0;
    for (const e of this.diaryEntries) {
      const d = new Date(e.date);
      if (d >= sevenDaysAgo) {
        sumMood += e.mood;
        countMood++;
      }
      for (const em of e.emotions) {
        emotionsCount[em] = (emotionsCount[em] ?? 0) + 1;
      }
    }
    this.diaryStats.avgMoodLast7 = countMood > 0 ? Math.round((sumMood / countMood) * 10) / 10 : null;
    this.diaryStats.emotionsCount = emotionsCount;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateShort(iso: string): string {
    return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getTestIds(): string[] {
    const ids = new Set(this.testResults.map(r => r.testId));
    return Array.from(ids);
  }

  getTopEmotions(limit: number): { name: string; count: number }[] {
    const entries = Object.entries(this.diaryStats.emotionsCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    return entries.slice(0, limit);
  }
}
