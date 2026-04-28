import { Injectable } from '@angular/core';
import PagedData from '../poco/pagedData';
import Job, { DisplayJob } from '../poco/job';

@Injectable({
  providedIn: 'root',
})
export class JobsHttpClient {
  async getOnePage(offset: number, limit: number) {
    const response = await fetch(`http://localhost:5193/job?offset=${offset}&limit=${limit}`);
    const json = await response.json();
    let source = json as PagedData<Job>;
    return {
      offset: source.offset,
      limit: source.limit,
      totalRecords: source.totalRecords,
      data: source.data.map(d => {
        return {
          jobId: d.jobId,
          jobTitle: d.jobTitle,
          employerName: d.employerName,
          numberOfPositions: d.numberOfPositions,
          startDate: new Date(d.startDate),
          endDate: new Date(d.endDate),
        } as DisplayJob
      })
    }
  }  
}
