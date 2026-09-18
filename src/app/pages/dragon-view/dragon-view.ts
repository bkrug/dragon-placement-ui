import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { PAGE_SIZE } from '../../../global-consts';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { JobInclusions } from '../../../misc/enums';
import { mapDragonToDisplayDragon } from '../../../misc/transformers';
import { Assignment, Dragon } from '../../../poco/models';

@Component({
  selector: 'app-dragon-view',
  imports: [ TableModule, RouterLink, DatePipe ],
  providers: [ AssignmentHttpClient ],
  templateUrl: './dragon-view.html',
  styleUrl: './dragon-view.scss',
})
export class DragonView implements OnDestroy {
  private dragonHttpClient = inject(AssignmentHttpClient);
  private activatedRoute = inject(ActivatedRoute);

  private dragonId: number = 0;
  private paramsSubscription = this.activatedRoute.params.subscribe((params) => {
    this.dragonId = params['dragonId'];
  });

  selectedAssignment = signal(null as Assignment | null);
  readonly pageSize = PAGE_SIZE;

  private dragonResource = rxResource({
    params: () => this.dragonId,
    stream: ({ params }) => this.dragonHttpClient.getDragonWithJobs(params, JobInclusions.CurrentAndFuture),
  });

  haveDragon = computed(() => this.dragonResource.value() !== undefined);
  dragon = computed(() => mapDragonToDisplayDragon(this.dragonResource.value()?.payload ?? new Dragon()));

  ngOnDestroy(): void {
    this.dragonHttpClient.unsubscribe();
    this.paramsSubscription.unsubscribe();
  }
}
