import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { ApiService } from 'src/app/services/api.service';
import { SyncService } from 'src/app/services/sync.service';
import { Subscription, fromEvent, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit, OnDestroy {
  userForm!: FormGroup;
  users: User[] = [];
  isOnline: boolean = navigator.onLine;
  isSyncing: boolean = false;
  private networkSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private syncService: SyncService,
  ) {}

  ngOnInit() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
    });

    this.loadUsers();
    this.setupNetworkTracking();
  }

  ngOnDestroy() {
    this.networkSubscription?.unsubscribe();
  }

  setupNetworkTracking() {
    this.networkSubscription = merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).subscribe((status) => {
      this.isOnline = status;
      if (status) {
        this.triggerSync();
      }
    });
  }

  triggerSync() {
    if (this.isSyncing) return;
    
    this.isSyncing = true;
    console.log('Internet back -> syncing');
    
    this.syncService.syncOfflineUsers().subscribe({
      next: (results) => {
        console.log('Sync results:', results);
        this.loadUsers();
        setTimeout(() => (this.isSyncing = false), 1500); // Small delay for visual effect
      },
      error: (err) => {
        console.error('Sync failed', err);
        this.isSyncing = false;
      }
    });
  }

  submitForm() {
    if (this.userForm.invalid) return;

    console.log('Submit Clicked');
    const user = this.userForm.value;
    
    this.syncService.submitUser(user).subscribe({
      next: () => {
        this.loadUsers();
        this.userForm.reset();
      },
      error: (err) => {
        console.error('Submission failed', err);
      }
    });
  }

  loadUsers() {
    this.apiService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        console.warn('Could not load users from API (likely offline)', err);
        // DataGroups 'freshness' strategy handles the cache automatically via service worker
      }
    });
  }
}
