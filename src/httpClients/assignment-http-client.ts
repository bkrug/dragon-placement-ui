import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { DragonCreateEdit, JobCreateEdit } from '../poco/endpointRequestBodies';
import { JobInclusions } from '../poco/enums';
import { Dragon, DragonValidationFailures, Job, JobValidationFailures, SkillTag } from '../poco/models';
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

  async getOnePageOfCandidates(jobId: number, skillTagIds: number[], offset: number, limit: number) {
    const skillTagQuery = skillTagIds.map(id => `&skillTagId=${id}`).join('');
    return await HttpHelpers.getOnePage<Dragon>(`${apiUrl}dragon?jobId=${jobId}&offset=${offset}&limit=${limit}${skillTagQuery}`);
  };

  async getOnePageOfAssignees(jobId: number, offset: number, limit: number) {
    return await HttpHelpers.getOnePage<Dragon>(`${apiUrl}job/${jobId}/assigned-dragon?offset=${offset}&limit=${limit}`);
  };

  async assignDragonToJob(dragonId: number, jobId: number) {
    return await HttpHelpers.requestValidatedResponse(`${apiUrl}job/${jobId}/assigned-dragon/${dragonId}`, 'POST');
  };

  async unassignDragonToJob(dragonId: number, jobId: number) {
    return await HttpHelpers.requestValidatedResponse(`${apiUrl}job/${jobId}/assigned-dragon/${dragonId}`, 'DELETE');
  };

  async getDragonWithJobs(dragonId: number, jobInclusions: JobInclusions) {
    return await HttpHelpers.requestValidatedPayload<Dragon>(`${apiUrl}dragon/${dragonId}?jobInclusions=${jobInclusions}`);
  };

  async postDragonForm(dragon: DragonCreateEdit) {
    return await HttpHelpers.submitForm<Dragon, DragonValidationFailures>(`${apiUrl}dragon`, 'POST', dragon);
  };

  async putDragonForm(dragonId: number, dragon: DragonCreateEdit) {
    return await HttpHelpers.submitForm<Dragon, DragonValidationFailures>(`${apiUrl}dragon/${dragonId}`, 'PUT', dragon);
  };

  async getJob(jobId: number) {
    return await HttpHelpers.requestValidatedPayload<Job>(`${apiUrl}job/${jobId}`);
  };  

  async postJobForm(job: JobCreateEdit) {
    return await HttpHelpers.submitForm<Job, JobValidationFailures>(`${apiUrl}job`, 'POST', job);
  };

  async putJobForm(jobId: number, job: JobCreateEdit) {
    return await HttpHelpers.submitForm<Job, JobValidationFailures>(`${apiUrl}job/${jobId}`, 'PUT', job);
  };

  async getAllSkills() {
    const limit = 1*1000*1000*1000;
    return await HttpHelpers.getOnePage<SkillTag>(`${apiUrl}skill-tag?offset=0&limit=${limit}`);
  };  
}