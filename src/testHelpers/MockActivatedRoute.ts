import { ParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

export class MockActivatedRoute {
  private subject = new BehaviorSubject<ParamMap>(this.createParamMap({}));
  
  // Mocking params
  params = this.subject.asObservable();

  // Method to simulate setting new params
  setParams(params: { [key: string]: any }) {
    this.subject.next(this.createParamMap(params));
  }

  private createParamMap(params: { [key: string]: any }): ParamMap {
    return {
      get: (key: string) => params[key],
      has: (key: string) => key in params,
      keys: Object.keys(params),
    } as ParamMap;
  }
}