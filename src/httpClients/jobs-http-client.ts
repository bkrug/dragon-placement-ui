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
        const startDate = new Date(d.startDateUnix * 1000);
        const endDate = new Date(d.endDateUnix * 1000);
        const openPositions = d.numberOfPositions - d.filledPositions;
        const openDescription = 
          openPositions === 0 ? 'Filled'
          : openPositions < 0 ? `${openPositions} of ${d.numberOfPositions} (overfilled)`
          : `${openPositions} of ${d.numberOfPositions}`;
        return {
          jobId: d.jobId,
          jobTitle: d.jobTitle,
          employerName: d.employerName,
          numberOfPositions: d.numberOfPositions,
          openPositions: openPositions,
          openDescription: openDescription,
          startDate: startDate,
          endDate: endDate
        } as DisplayJob
      })
    }
  }
}