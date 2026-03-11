import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { environment } from '../../../environments/environment';

const STORAGE_KEY = 'senti2_area_personal';

export interface TestResultRecord {
  testId: string;
  testTitle: string;
  score: number;
  displayScore: number;
  displayMax: number;
  level: string;
  date: string; // ISO
}

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mood: number; // 1-10
  emotions: string[];
  note: string;
  createdAt: string; // ISO
}

interface StoredData {
  testResults: TestResultRecord[];
  diaryEntries: DiaryEntry[];
}

@Injectable({ providedIn: 'root' })
export class AreaPersonalDataService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authApi: AuthApiService
  ) {}

  private getToken(): string | null {
    return this.authApi.getToken();
  }

  private getData(): StoredData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredData;
        return {
          testResults: parsed.testResults ?? [],
          diaryEntries: parsed.diaryEntries ?? []
        };
      }
    } catch (_) {}
    return { testResults: [], diaryEntries: [] };
  }

  private setData(data: StoredData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  private headers(): HttpHeaders {
    const token = this.getToken();
    let h = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      h = h.set('Authorization', `Bearer ${token}`);
    }
    return h;
  }

  async addTestResult(record: Omit<TestResultRecord, 'date'>): Promise<void> {
    const withDate = { ...record, date: new Date().toISOString() };
    if (this.getToken()) {
      try {
        await firstValueFrom(
          this.http.post(
            `${this.apiUrl}/area-personal/test-results`,
            {
              test_id: record.testId,
              test_title: record.testTitle,
              score: record.score,
              display_score: record.displayScore,
              display_max: record.displayMax,
              level: record.level
            },
            { headers: this.headers() }
          )
        );
        return;
      } catch (_) {
      }
    }
    const data = this.getData();
    data.testResults.push(withDate);
    this.setData(data);
  }

  async getTestResults(): Promise<TestResultRecord[]> {
    if (this.getToken()) {
      try {
        const res = await firstValueFrom(
          this.http.get<{ data: TestResultRecord[] }>(`${this.apiUrl}/area-personal/test-results`, {
            headers: this.headers()
          })
        );
        const list = res?.data ?? [];
        return list
          .map(r => ({
            ...r,
            date: (r as any).date ?? new Date().toISOString()
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } catch (_) {
      }
    }
    return [...this.getData().testResults].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  getTestResultsByTestId(testId: string): Promise<TestResultRecord[]> {
    return this.getTestResults().then(list => list.filter(r => r.testId === testId));
  }

  async addDiaryEntry(entry: Omit<DiaryEntry, 'id' | 'createdAt'>): Promise<void> {
    const newEntry: DiaryEntry = {
      ...entry,
      id: `diary_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    if (this.getToken()) {
      try {
        await firstValueFrom(
          this.http.post(
            `${this.apiUrl}/area-personal/diary-entries`,
            {
              date: entry.date,
              mood: entry.mood,
              emotions: entry.emotions ?? [],
              note: entry.note ?? ''
            },
            { headers: this.headers() }
          )
        );
        return;
      } catch (_) {
      }
    }
    const data = this.getData();
    data.diaryEntries.push(newEntry);
    this.setData(data);
  }

  async getDiaryEntries(): Promise<DiaryEntry[]> {
    if (this.getToken()) {
      try {
        const res = await firstValueFrom(
          this.http.get<{ data: DiaryEntry[] }>(`${this.apiUrl}/area-personal/diary-entries`, {
            headers: this.headers()
          })
        );
        const list = res?.data ?? [];
        return list
          .map(e => ({
            ...e,
            createdAt: (e as any).createdAt ?? new Date().toISOString()
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } catch (_) {
      }
    }
    return [...this.getData().diaryEntries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  getDiaryEntriesForDate(date: string): Promise<DiaryEntry[]> {
    return this.getDiaryEntries().then(list => list.filter(e => e.date === date));
  }
}
