import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { JobInclusions } from '../poco/enums';
import { Dragon, DragonValidationFailures, Job } from '../poco/models';
import { ValidatedPayload } from '../poco/standard-responses';
import { HttpHelpers } from './http-helpers';

const apiUrl = environment.backendApi.endsWith('/')
  ? environment.backendApi
  : environment.backendApi + '/'

@Injectable({
  providedIn: 'root',
})
export class AssignmentHttpClient {
  async getOnePageOfJobs(offset: number, limit: number) {
    return await HttpHelpers.getOnePage<Job>(`${apiUrl}job?offset=${offset}&limit=${limit}`);
  }

  async getOnePageOfDragons(offset: number, limit: number) {
    return await HttpHelpers.getOnePage<Dragon>(`${apiUrl}dragon?offset=${offset}&limit=${limit}`);
  };

  async getOnePageOfCandidates(jobId: number, offset: number, limit: number) {
    return await HttpHelpers.getOnePage<Dragon>(`${apiUrl}dragon?jobId=${jobId}&offset=${offset}&limit=${limit}`);
  };

  async getOnePageOfAssignees(jobId: number, offset: number, limit: number) {
    return await HttpHelpers.getOnePage<Dragon>(`${apiUrl}job/${jobId}/assigned-dragon?offset=${offset}&limit=${limit}`);
  };

  async getDragonWithJobs(dragonId: number, jobInclusions: JobInclusions) {
    const response = await fetch(`${apiUrl}dragon/${dragonId}?jobInclusions=${jobInclusions}`);
    const json = await response.json();
    return json as ValidatedPayload<Dragon>;
  };

  async assignDragonToJob(dragonId: number, jobId: number) {
    return await HttpHelpers.getValidatedResponse(`${apiUrl}job/${jobId}/assigned-dragon/${dragonId}`, {
      method: 'POST'
    });
  };

  async unassignDragonToJob(dragonId: number, jobId: number) {
    return await HttpHelpers.getValidatedResponse(`${apiUrl}job/${jobId}/assigned-dragon/${dragonId}`, {
      method: 'DELETE'
    });
  };

  async postDragonForm(dragon: Dragon) {
    return await HttpHelpers.submitForm<Dragon, DragonValidationFailures>(`${apiUrl}dragon`, 'POST', dragon);
  };

  async putDragonForm(dragonId: number, dragon: Dragon) {
    return await HttpHelpers.submitForm<Dragon, DragonValidationFailures>(`${apiUrl}dragon/${dragonId}`, 'PUT', dragon);
  };
}