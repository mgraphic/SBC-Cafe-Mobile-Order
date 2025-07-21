import {
  Component,
  inject,
  OnInit,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { KeyValue, TitleCasePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { map, take } from 'rxjs';
import {
  getUserPermissionGroupFromPermission,
  isPermission,
  isPermissionGroup,
  isRoleInPermissionGroup,
  IUser,
  rbacPermissions,
  rbacRolePermissionGroupAllowances,
  rbacRoles,
  UserPermission,
  UserPermissionGroup,
  UserRole,
} from 'sbc-cafe-shared-module';
import { UsersService } from '../../shared/services/users.service';
import { UserService } from '../../../../../shared-lib/src/lib/services/user.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { UserResponse } from '../../shared/models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    ModalComponent,
    TitleCasePipe,
    ReactiveFormsModule,
    NgbDropdownModule,
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent implements OnInit {
  private readonly userModalTemplate =
    viewChild<TemplateRef<HTMLElement>>('userModalTemplate');
  private readonly usersService = inject(UsersService);
  private readonly modalService = inject(NgbModal);
  private readonly fb = inject(FormBuilder);
  protected readonly userService = inject(UserService);

  protected modalMode?: 'add' | 'edit';
  protected users: IUser[] = [];
  protected userForm = this.fb.group({
    id: [''],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['DEFAULT' as UserRole, Validators.required],
    isActive: [false],
    permissions: [this.fb.array<UserPermission[]>([])], // This can be used to manage user permissions
  });
  protected readonly userRoles: KeyValue<UserRole, string>[] = Object.entries(
    rbacRoles
  ).map(([key, value]) => ({
    key: key as UserRole,
    value,
  }));
  protected readonly userPermissions: KeyValue<UserPermission, string>[] =
    Object.entries(rbacPermissions).map(([key, value]) => ({
      key: key as UserPermission,
      value,
    }));
  private currentUserPermissions: UserPermission[] = [];

  ngOnInit(): void {
    this.fetchUsers();
  }

  private fetchUsers(): void {
    this.usersService
      .getUsers()
      .pipe(
        take(1),
        map((users) =>
          users.sort((a, b) => a.lastName.localeCompare(b.lastName))
        )
      )
      .subscribe({
        next: (users): void => {
          this.users = users;
        },
        error: (error): void => {
          console.error('Error fetching users:', error);
        },
      });
  }

  protected deleteUser(user: IUser): void {
    if (user.id) {
      this.usersService.deleteUser(user.id).subscribe({
        next: () => {
          console.log('User deleted successfully');
          this.fetchUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
        },
      });
    }
  }

  protected editUser(user: IUser): void {
    // Set current user permissions for checkbox state management
    this.currentUserPermissions = user.permissions || [];

    this.userForm.patchValue({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      permissions: user.permissions || [],
    });

    this.modalMode = 'edit';
    const modalRef = this.modalService.open(this.userModalTemplate(), {
      size: 'md',
    });
  }

  protected addUser(): void {
    // Reset current user permissions for new user
    this.currentUserPermissions = [];

    this.userForm.reset({
      id: null,
      firstName: null,
      lastName: null,
      email: null,
      role: null,
      isActive: true,
      permissions: [],
    });
    this.modalMode = 'add';
    const modalRef = this.modalService.open(this.userModalTemplate(), {
      size: 'md',
    });
  }

  protected saveUser(): void {
    if (this.userForm.valid) {
      const userData = {
        ...this.userForm.value,
        permissions: this.currentUserPermissions,
      };
      if (this.modalMode === 'edit') {
        // Update existing user
        console.log('Update user:', userData);
        this.usersService
          .updateUser(userData.id!, userData as Partial<IUser>)
          .subscribe({
            next: () => {
              console.log('User updated successfully');
              this.fetchUsers();
            },
            error: (error) => {
              console.error('Error updating user:', error);
            },
          });
      } else {
        // Create new user
        console.log('Create user:', userData);
        this.usersService.addUser(userData as UserResponse).subscribe({
          next: () => {
            console.log('User created successfully');
            this.fetchUsers();
          },
          error: (error) => {
            console.error('Error creating user:', error);
          },
        });
      }
    }
  }

  protected isPermissionSelected(permissionKey: UserPermission): boolean {
    const role = this.userForm.get('role')?.value as UserRole;
    const [permissionGroup] = permissionKey.split('_') as [UserPermissionGroup];
    if (
      role &&
      (this.hasPermission(role, permissionGroup) ||
        this.hasPermission(role, permissionKey))
    ) {
      return true;
    }
    return this.currentUserPermissions.includes(permissionKey);
  }

  protected isPermissionDisabled(permissionKey: UserPermission): boolean {
    const role = this.userForm.get('role')?.value as UserRole;
    const [permissionGroup] = permissionKey.split('_') as [UserPermissionGroup];
    if (
      role &&
      (this.hasPermission(role, permissionGroup) ||
        this.hasPermission(role, permissionKey))
    ) {
      return true;
    }
    return false;
  }

  protected onPermissionChange(
    permissionKey: UserPermission,
    event: Event
  ): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (!this.currentUserPermissions.includes(permissionKey)) {
        this.currentUserPermissions.push(permissionKey);
      }
    } else {
      const index = this.currentUserPermissions.indexOf(permissionKey);
      if (index > -1) {
        this.currentUserPermissions.splice(index, 1);
      }
    }

    // Update the form control
    this.userForm.patchValue({
      permissions: this.currentUserPermissions as any,
    });
  }

  private hasPermission(
    role: UserRole,
    permission: UserPermissionGroup | UserPermission
  ): boolean {
    if (isPermission(permission)) {
      // permission is type of UserPermission
      const permissionGroup = getUserPermissionGroupFromPermission(permission);

      if (permissionGroup) {
        if (isRoleInPermissionGroup(role, permissionGroup)) {
          return true;
        }
      }

      if (rbacRolePermissionGroupAllowances[role].includes(permission)) {
        return true;
      }

      return false;
    }

    if (isPermissionGroup(permission)) {
      return isRoleInPermissionGroup(role, permission as UserPermissionGroup);
    }

    return false;
  }
}
