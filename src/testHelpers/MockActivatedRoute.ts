import { Params } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

export class MockActivatedRoute {
  private subject = new BehaviorSubject<Params>({});

  params = this.subject.asObservable();

  setParams(params: Params) {
    this.subject.next(params);
  }
}