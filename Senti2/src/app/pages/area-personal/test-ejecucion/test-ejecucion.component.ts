import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { getTestById, TestDefinition, InterpretationResult } from '../../../core/data/emotional-tests.data';
import { AreaPersonalDataService } from '../../../core/services/area-personal-data.service';

@Component({
  selector: 'app-test-ejecucion',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './test-ejecucion.component.html',
  styleUrls: ['./test-ejecucion.component.css']
})
export class TestEjecucionComponent implements OnInit {
  test: TestDefinition | null = null;
  answers: Record<string, number> = {};
  submitted = false;
  totalScore = 0;
  interpretation: InterpretationResult | null = null;
  scaleOptions: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private areaData: AreaPersonalDataService
  ) {}

  ngOnInit(): void {
    const testId = this.route.snapshot.paramMap.get('testId');
    if (!testId) {
      this.router.navigate(['/area-personal/tests-emocionales']);
      return;
    }
    this.test = getTestById(testId);
    if (!this.test) {
      this.router.navigate(['/area-personal/tests-emocionales']);
      return;
    }
    this.scaleOptions = Array.from(
      { length: this.test.scaleMax - this.test.scaleMin + 1 },
      (_, i) => this.test!.scaleMin + i
    );
    this.test.questions.forEach(q => {
      this.answers[q.id] = this.test!.scaleMin;
    });
  }

  getOptionLabel(value: number): string {
    if (!this.test) return '';
    const index = value - this.test.scaleMin;
    return this.test.scaleLabels[index] ?? String(value);
  }

  allAnswered(): boolean {
    if (!this.test) return false;
    return this.test.questions.every(q => this.answers[q.id] !== undefined && this.answers[q.id] !== null);
  }

  submit(): void {
    if (!this.test || !this.allAnswered()) return;
    this.totalScore = this.test.questions.reduce((sum, q) => sum + Number(this.answers[q.id] ?? 0), 0);
    this.interpretation = this.test.getInterpretation(this.totalScore);
    this.submitted = true;
    void this.areaData.addTestResult({
      testId: this.test.id,
      testTitle: this.test.title,
      score: this.totalScore,
      displayScore: this.displayScore,
      displayMax: this.displayMaxScore,
      level: this.interpretation.level
    });
  }

  get maxScore(): number {
    if (!this.test) return 0;
    return this.test.questions.length * this.test.scaleMax;
  }

  get displayScore(): number {
    if (!this.test) return 0;
    return this.test.scoreDisplay === 'percentage' ? this.totalScore * 4 : this.totalScore;
  }

  get displayMaxScore(): number {
    if (!this.test) return 0;
    return this.test.scoreDisplay === 'percentage' ? 100 : this.maxScore;
  }

  volverALista(): void {
    this.router.navigate(['/area-personal/tests-emocionales']);
  }

  hacerOtroTest(): void {
    this.router.navigate(['/area-personal/tests-emocionales']);
  }
}
