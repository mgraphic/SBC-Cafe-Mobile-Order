import { Component, OnInit, inject, model, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { take, switchMap, Observable } from 'rxjs';
import {
  UserTrackerLogsLookup,
  IPageable,
  IUser,
  ITracker,
  PaginatedPayload,
} from 'sbc-cafe-shared-module';
import { environment } from '../../../../../shared-lib/src/environment';
import {
  PaginatedComponent,
  ComboboxComponent,
  ComboboxValueType,
  IdValuePair,
} from '../../../../../shared-lib/src/public-api';
import { UserService } from '../../shared/services/user.service';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-user-service-logs',
  standalone: true,
  imports: [SharedModule, PaginatedComponent, ComboboxComponent],
  templateUrl: './user-service-logs.component.html',
  styleUrl: './user-service-logs.component.scss',
})
export class UserServiceLogsComponent implements OnInit {
  private readonly userService = inject(UserService);

  protected readonly userModel = model<ComboboxValueType>();
  protected readonly filter = signal<{
    lookup: UserTrackerLogsLookup;
    value: string;
  } | null>(null);
  protected readonly filter$ = toObservable(this.filter);
  protected readonly pageable = signal<IPageable>({
    pageSize: environment.paginatedDefaultPagesize,
    pageNumber: 1,
  });
  protected readonly currentPage = signal<number>(1);
  protected readonly currentPage$ = toObservable(this.currentPage);
  protected users: IUser[] = [];
  protected logs: ITracker[] = [];
  protected usersDropdownOptions: { id: string; value: string }[] = [];

  ngOnInit(): void {
    this.userService
      .getUsers()
      .pipe(
        take(1),
        switchMap((users) => {
          this.users = users;
          this.usersDropdownOptions = users.map((user) => ({
            id: user.id,
            value: `${user.lastName}, ${user.firstName} (${user.email})`,
          }));
          this.usersDropdownOptions.unshift({
            id: '',
            value: 'All Users',
          });

          return this.getLogs(this.pageable()).pipe(take(1));
        })
      )
      .subscribe({
        next: this.processLogResults.bind(this),
        error: (error): void => {
          console.error(error);
        },
      });

    this.currentPage$
      .pipe(
        switchMap((pageNumber) =>
          this.getLogs({
            ...this.pageable(),
            pageNumber,
          }).pipe(take(1))
        )
      )
      .subscribe({
        next: this.processLogResults.bind(this),
        error: (error): void => {
          this.logs = [];
          console.error(error);
        },
      });

    this.filter$
      .pipe(
        switchMap((filter) => {
          this.currentPage.set(1);

          return this.getLogs(
            this.pageable(),
            filter?.lookup,
            filter?.value
          ).pipe(take(1));
        })
      )
      .subscribe({
        next: this.processLogResults.bind(this),
        error: (error): void => {
          this.logs = [];
          console.error(error);
        },
      });
  }

  protected getUserName(userId: string): string {
    const user = this.users.find((user) => user.id === userId);
    return user
      ? `${user?.firstName} ${user?.lastName} (${user?.email})`
      : userId;
  }

  protected userFilter(): void {
    const comboboxValue = this.userModel();

    if (!comboboxValue) {
      this.filterLogs('userId', '');
      return;
    }

    if (typeof comboboxValue === 'string') {
      this.filterLogs('userId', comboboxValue);
      return;
    }

    const { id } = comboboxValue as IdValuePair<string>;
    this.filterLogs('userId', id as string);
  }

  private getLogs(
    pageable: IPageable,
    lookup?: UserTrackerLogsLookup,
    lookupValue?: string
  ): Observable<PaginatedPayload<ITracker>> {
    return this.userService.getLogs(pageable, lookup, lookupValue);
  }

  private processLogResults(response: PaginatedPayload<ITracker>): void {
    this.logs = response.data;
    this.pageable.set(response.metadata);
  }

  private filterLogs(lookup: UserTrackerLogsLookup, value: string): void {
    this.filter.set(lookup && value.length > 0 ? { lookup, value } : null);
  }
}
