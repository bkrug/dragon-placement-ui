import { Component, inject, OnInit, signal } from '@angular/core';
import { DragonHttpClient } from '../../httpClients/dragon-http-client';
import { JobInclusions } from '../../poco/JobInclusions';
import { ActivatedRoute } from '@angular/router';
import { Dragon } from '../../poco/dragon';

@Component({
  selector: 'app-dragon-view',
  imports: [ ],
  templateUrl: './dragon-view.html',
  styleUrl: './dragon-view.scss',
})
export class DragonView implements OnInit {
  dragonHttpClient = inject(DragonHttpClient);
  private activatedRoute = inject(ActivatedRoute);

  private dragonId: number = 0;
  haveDragon = signal(false);
  dragon = signal(new Dragon());
  
  constructor() {
    this.activatedRoute.params.subscribe((params) => {
      this.dragonId = params['dragonId'];
    });
  }  

  ngOnInit(): void {
    this.dragonHttpClient.getDragonWithJobs(this.dragonId, JobInclusions.CurrentAndFuture)
      .then(validatedResponse => {
        this.dragon.set(validatedResponse.payload);
        this.haveDragon.set(true);
        console.log(JSON.stringify(validatedResponse));
      });
  }
}
