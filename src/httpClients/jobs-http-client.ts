import { Injectable } from '@angular/core';
import { Job } from '../poco/models';
import { HttpHelpers } from './http-helpers';

@Injectable({
  providedIn: 'root',
})
export class JobsHttpClient {
  async getOnePage(offset: number, limit: number) {
    return await HttpHelpers.getOnePage<Job>(`http://localhost:5193/job?offset=${offset}&limit=${limit}`);
  }
}