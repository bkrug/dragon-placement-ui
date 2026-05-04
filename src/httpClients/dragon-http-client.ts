import { Injectable } from '@angular/core';
import PagedData from '../poco/pagedData';
import { Dragon } from '../poco/dragon';
import { ValidatedPayload, ValidatedResponse } from '../poco/validatedResponse'; 
import { JobInclusions } from '../poco/JobInclusions';

@Injectable({
  providedIn: 'root',
})
export class DragonHttpClient {
  async getOnePageOfCandidates(jobId: number, offset: number, limit: number) {
    const response = await fetch(`http://localhost:5193/dragon?jobId=${jobId}&offset=${offset}&limit=${limit}`);
    const json = await response.json();
    let source = json as PagedData<Dragon>;
    return {
      offset: source.offset,
      limit: source.limit,
      totalRecords: source.totalRecords,
      data: source.data
    }
  }

  async getDragonWithJobs(dragonId: number, jobInclusions: JobInclusions) {
    const response = await fetch(`http://localhost:5193/dragon/${dragonId}?jobInclusions=${jobInclusions}`);
    const json = await response.json();
    return json as ValidatedPayload<Dragon>;
  }

  async getOnePageOfAssignees(jobId: number, offset: number, limit: number) {
    const response = await fetch(`http://localhost:5193/job/${jobId}/assigned-dragon?offset=${offset}&limit=${limit}`);
    const json = await response.json();
    let source = json as PagedData<Dragon>;
    return {
      offset: source.offset,
      limit: source.limit,
      totalRecords: source.totalRecords,
      data: source.data
    }
  }

  async assignDragonToJob(dragonId: number, jobId: number) {
    try {
      const response = await fetch(`http://localhost:5193/job/${jobId}/assigned-dragon/${dragonId}`, {
        method: "POST"
      });
      const json = await response.json();
      const validatedResponse = json as ValidatedResponse;
      return validatedResponse;
    }
    catch (ex) {
      return {
        isSuccess: false,
        isInternalError: true,
        validationFailures: [ JSON.stringify(ex) ]
      } as ValidatedResponse
    }
  }
  
  async unassignDragonToJob(dragonId: number, jobId: number) {
    try {
      const response = await fetch(`http://localhost:5193/job/${jobId}/assigned-dragon/${dragonId}`, {
        method: "DELETE"
      });
      const json = await response.json();
      const validatedResponse = json as ValidatedResponse;
      return validatedResponse;
    }
    catch (ex) {
      return {
        isSuccess: false,
        isInternalError: true,
        validationFailures: [ JSON.stringify(ex) ]
      } as ValidatedResponse
    }
  }  
}
