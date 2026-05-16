import { Injectable } from '@angular/core';
import { Dragon, Job, DragonValidationFailures } from '../poco/models';
import { ValidatedForm, ValidatedPayload } from '../poco/standard-responses'; 
import { JobInclusions } from '../poco/enums';
import { HttpHelpers } from './http-helpers';
import { environment } from '../environments/environment';

const apiUrl = environment.backendApi.endsWith('/')
  ? environment.backendApi
  : environment.backendApi + '/'

@Injectable({
  providedIn: 'root',
})
export class AssignmentHttpClient {
  async getOnePageOfDragons(offset: number, limit: number) {
    return await HttpHelpers.getOnePage<Dragon>(`${apiUrl}dragon?offset=${offset}&limit=${limit}`);
  };

  async getOnePageOfCandidates(jobId: number, offset: number, limit: number) {
    return await HttpHelpers.getOnePage<Dragon>(`${apiUrl}dragon?jobId=${jobId}&offset=${offset}&limit=${limit}`);
  };

  async getOnePageOfAssignees(jobId: number, offset: number, limit: number) {
    return await HttpHelpers.getOnePage<Dragon>(`${apiUrl}job/${jobId}/assigned-dragon?offset=${offset}&limit=${limit}`);
  };

  async getOnePageOfJobs(offset: number, limit: number) {
    return await HttpHelpers.getOnePage<Job>(`${apiUrl}job?offset=${offset}&limit=${limit}`);
  }  

  async getDragonWithJobs(dragonId: number, jobInclusions: JobInclusions) {
    const response = await fetch(`${apiUrl}dragon/${dragonId}?jobInclusions=${jobInclusions}`);
    const json = await response.json();
    return json as ValidatedPayload<Dragon>;
  };

  async assignDragonToJob(dragonId: number, jobId: number) {
    return await HttpHelpers.getValidatedResponse(`${apiUrl}job/${jobId}/assigned-dragon/${dragonId}`, {
      method: "POST"
    });
  };

  async unassignDragonToJob(dragonId: number, jobId: number) {
    return await HttpHelpers.getValidatedResponse(`${apiUrl}job/${jobId}/assigned-dragon/${dragonId}`, {
      method: "DELETE"
    });
  };

  async postDragonForm(dragon: Dragon) {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    const response = await fetch(`${apiUrl}dragon`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(dragon)
    });
    const json = await response.json();
    if (response.ok) {
      return json as ValidatedPayload<Dragon>;
    }
    else {
      return json as ValidatedForm<DragonValidationFailures>;
    }
  };
}