import { Component, inject, OnInit, signal } from '@angular/core';
import { AssignmentHttpClient } from '../../httpClients/assignment-http-client';
import { JobInclusions } from '../../poco/enums';
import { ActivatedRoute } from '@angular/router';
import { DisplayDragon, Assignment } from '../../poco/models';
import { TableModule } from 'primeng/table';
import { mapDragonToDisplayDragon } from '../../transformers';
import { DatePipe } from '@angular/common';
import { PAGE_SIZE } from '../../GlobalConsts';

@Component({
  selector: 'app-dragon-view',
  imports: [ DatePipe, TableModule ],
  templateUrl: './dragon-view.html',
  styleUrl: './dragon-view.scss',
})
export class DragonView implements OnInit {
  dragonHttpClient = inject(AssignmentHttpClient);
  private activatedRoute = inject(ActivatedRoute);

  private dragonId: number = 0;
  haveDragon = signal(false);
  dragon = signal(new DisplayDragon());
  selectedAssignment = signal(null as Assignment | null);
  pageSize = PAGE_SIZE;
  
  constructor() {
    this.activatedRoute.params.subscribe((params) => {
      this.dragonId = params['dragonId'];
    });
  }  

  ngOnInit(): void {
    this.dragonHttpClient.getDragonWithJobs(this.dragonId, JobInclusions.CurrentAndFuture)
      .then(validatedResponse => {
        this.dragon.set(mapDragonToDisplayDragon(validatedResponse.payload));
        this.haveDragon.set(true);
        console.log(JSON.stringify(validatedResponse));
      });
  }
}
