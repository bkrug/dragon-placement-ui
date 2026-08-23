import { DatePipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { PAGE_SIZE } from '../../../global-consts';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { JobInclusions } from '../../../misc/enums';
import { mapDragonToDisplayDragon } from '../../../misc/transformers';
import { Assignment, DisplayDragon } from '../../../poco/models';

@Component({
  selector: 'app-dragon-view',
  imports: [ TableModule, RouterLink, DatePipe ],
  templateUrl: './dragon-view.html',
  styleUrl: './dragon-view.scss',
})
export class DragonView implements OnInit, OnDestroy {
  dragonHttpClient = inject(AssignmentHttpClient);
  private activatedRoute = inject(ActivatedRoute);

  private dragonId: number = 0;
  haveDragon = signal(false);
  dragon = signal(new DisplayDragon());
  selectedAssignment = signal(null as Assignment | null);
  readonly pageSize = PAGE_SIZE;

  constructor() {
    this.activatedRoute.params.subscribe((params) => {
      this.dragonId = params['dragonId'];
    });
  }

  ngOnInit(): void {
    this.dragonHttpClient.getDragonWithJobs(this.dragonId, JobInclusions.CurrentAndFuture)
      .subscribe(validatedResponse => {
        this.dragon.set(mapDragonToDisplayDragon(validatedResponse.payload));
        this.haveDragon.set(true);
      });
  }

  ngOnDestroy(): void {
    this.dragonHttpClient.unsubscribe();
  }
}
