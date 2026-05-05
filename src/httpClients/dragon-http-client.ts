import { Injectable } from '@angular/core';
import { Dragon } from '../poco/models';
import { ValidatedPayload } from '../poco/validatedResponse'; 
import { JobInclusions } from '../poco/enums';
import { HttpHelpers } from './http-helpers';

@Injectable({
  providedIn: 'root',
})
export class DragonHttpClient {
  async getOnePageOfDragons(offset: number, limit: number) {
    return await HttpHelpers.getOnePage<Dragon>(`http://localhost:5193/dragon?offset=${offset}&limit=${limit}`);
  };

  async getOnePageOfCandidates(jobId: number, offset: number, limit: number) {
    return await HttpHelpers.getOnePage<Dragon>(`http://localhost:5193/dragon?jobId=${jobId}&offset=${offset}&limit=${limit}`);
  };

  async getDragonWithJobs(dragonId: number, jobInclusions: JobInclusions) {
    const response = await fetch(`http://localhost:5193/dragon/${dragonId}?jobInclusions=${jobInclusions}`);
    const json = await response.json();
    return json as ValidatedPayload<Dragon>;
  };

  async getOnePageOfAssignees(jobId: number, offset: number, limit: number) {
    return await HttpHelpers.getOnePage<Dragon>(`http://localhost:5193/job/${jobId}/assigned-dragon?offset=${offset}&limit=${limit}`);
  };

  async assignDragonToJob(dragonId: number, jobId: number) {
    return await HttpHelpers.getValidatedResponse(`http://localhost:5193/job/${jobId}/assigned-dragon/${dragonId}`, {
      method: "POST"
    });
  };
  
  async unassignDragonToJob(dragonId: number, jobId: number) {
    return await HttpHelpers.getValidatedResponse(`http://localhost:5193/job/${jobId}/assigned-dragon/${dragonId}`, {
      method: "DELETE"
    });
  };
}