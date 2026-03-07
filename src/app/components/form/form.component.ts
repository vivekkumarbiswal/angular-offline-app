import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { ApiService } from 'src/app/services/api.service';
import { SyncService } from 'src/app/services/sync.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit {
  userForm!: FormGroup;
  users: User[] = [];
  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private syncService: SyncService,
  ) {}

  ngOnInit() {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
    });
    this.loadUsers();

    window.addEventListener('online', () => {
      console.log('Internet back -> syncing');
      this.syncService.syncOfflineUsers().subscribe(() => {
        this.loadUsers();
      });
    });
  }

  submitForm() {
    console.log('Submit Clicked');
    const user = this.userForm.value;
    this.syncService.submitUser(user);
    this.loadUsers();
    this.userForm.reset();
  }

  loadUsers() {
    this.apiService.getUsers().subscribe((data) => {
      this.users = data;
    });
  }
}
