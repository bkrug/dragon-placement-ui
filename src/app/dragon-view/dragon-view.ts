import { Component, inject, OnInit, signal } from '@angular/core';
import { DragonHttpClient } from '../../httpClients/dragon-http-client';
import { JobInclusions } from '../../poco/job-inclusions';
import { ActivatedRoute } from '@angular/router';
import { DisplayDragon } from '../../poco/models';
import { mapDragonToDisplayDragon } from '../../transformers';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dragon-view',
  imports: [ DatePipe ],
  templateUrl: './dragon-view.html',
  styleUrl: './dragon-view.scss',
})
export class DragonView implements OnInit {
  dragonHttpClient = inject(DragonHttpClient);
  private activatedRoute = inject(ActivatedRoute);

  private dragonId: number = 0;
  haveDragon = signal(false);
  dragon = signal(new DisplayDragon());
  
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
