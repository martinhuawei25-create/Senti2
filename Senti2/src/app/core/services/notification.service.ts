import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  visible: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 1;
  private notifications: Notification[] = [];
  private list$ = new BehaviorSubject<Notification[]>([]);
  private timeoutMs = 4000;

  get list(): Notification[] {
    return this.notifications;
  }

  get listSnapshot(): Notification[] {
    return this.list$.value;
  }

  listChanges = this.list$.asObservable();

  private emit(): void {
    this.list$.next([...this.notifications]);
  }

  show(type: NotificationType, message: string): void {
    const n: Notification = {
      id: this.nextId++,
      type,
      message,
      visible: true,
    };
    this.notifications.push(n);
    this.emit();
    setTimeout(() => {
      n.visible = false;
      this.emit();
      setTimeout(() => this.remove(n.id), 300);
    }, this.timeoutMs);
  }

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  remove(id: number): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.emit();
  }

  messageForStatus(status: number, defaultMsg: string): string {
    if (status === 401) return 'Sesión expirada. Inicia sesión de nuevo.';
    if (status === 403) return 'No tienes permiso para esta acción.';
    if (status >= 500) return 'Error en el servidor. Inténtalo más tarde.';
    return defaultMsg;
  }
}
