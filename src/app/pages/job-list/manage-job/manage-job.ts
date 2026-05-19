import { DatePipe } from '@angular/common';
import { Component, EventEmitter, input, Output, viewChildren } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DragonTableType } from '../../../../poco/enums';
import { DisplayJob } from '../../../../poco/models';
import { DragonTable } from '../../../shared-components/dragon-table/dragon-table';

@Component({
  selector: 'app-manage-job',
  imports: [ DatePipe, ButtonModule, DragonTable ],
  templateUrl: './manage-job.html',
  styleUrl: './manage-job.scss',
})
export class ManageJob {
  @Output() closedManageJob = new EventEmitter();
  dragonTables = viewChildren(DragonTable);

  selectedJob = input<DisplayJob | null>();
  DragonTableType = DragonTableType;

  clearSelection() {
    this.closedManageJob.emit(null);
  }

  reloadDragonTables() {
    this.dragonTables().forEach(element => {
      element.forcePageLoad();
    });
  }
}
