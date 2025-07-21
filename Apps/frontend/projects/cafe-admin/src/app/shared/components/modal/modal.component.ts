import { CommonModule } from '@angular/common';
import { Component, input, TemplateRef, contentChild } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  public readonly modalRef = input.required<NgbModalRef>();
  public readonly modalTitle = input<string>();

  protected readonly headerContent =
    contentChild<TemplateRef<any>>('headerContent');
  protected readonly bodyContent =
    contentChild<TemplateRef<any>>('bodyContent');
  protected readonly footerContent =
    contentChild<TemplateRef<any>>('footerContent');
}
