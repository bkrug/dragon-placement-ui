import { Component, input, EventEmitter, Output, viewChildren } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DragonTable } from '../dragon-table/dragon-table';
import { DisplayJob } from '../../poco/job';

@Component({
  selector: 'app-manage-job',
  imports: [ DatePipe, ButtonModule, DragonTable ],
  templateUrl: './manage-job.html',
  styleUrl: './manage-job.scss',
})
export class ManageJob {
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  dragonTables = viewChildren(DragonTable);

  selectedJob = input<DisplayJob | null>();

  clearSelection() {
    this.onClose.emit(null);
  }

  reloadDragonTables() {
    this.dragonTables().forEach(element => {
      element.forcePageLoad();
    });
  }
}
