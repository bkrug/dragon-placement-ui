import { Injectable } from '@angular/core';
import { JobInclusions } from '../misc/enums';
import { DragonCreateEdit, JobCreateEdit } from '../poco/endpoint-request-bodies';
import { Dragon, Job, SkillTag } from '../poco/models';
import { ValidationFailures } from '../poco/validation-failures';
import { apiUrl } from './api-url';
import { BaseHttpClient } from './base-http-client';
import { HttpHelpers } from './http-helpers';

@Injectable({
  providedIn: 'root',
})
export class AssignmentHttpClient extends BaseHttpClient {
  getOnePageOfJobs(offset: number, limit: number, jobInclusions: JobInclusions) {
    return this.getOnePage<Job>(`${apiUrl}job?offset=${offset}&limit=${limit}&jobInclusions=${jobInclusions}`);
  }

  getOnePageOfDragons(offset: number, limit: number) {
    return this.getOnePage<Dragon>(`${apiUrl}dragon?offset=${offset}&limit=${limit}`);
  };

  getOnePageOfCandidates(jobId: number, skillTagIds: number[], fightingSkill: string | null, offset: number, limit: number) {
    const skillTagQuery = skillTagIds.map(id => `&skillTagId=${id}`).join('');
    const fightingSkillQuery = fightingSkill == null ? '' : `&fightingSkill=${fightingSkill}`;
    return this.getOnePage<Dragon>(`${apiUrl}dragon?jobId=${jobId}&offset=${offset}&limit=${limit}${fightingSkillQuery}${skillTagQuery}`);
  };

  getOnePageOfAssignees(jobId: number, offset: number, limit: number) {
    return this.getOnePage<Dragon>(`${apiUrl}job/${jobId}/assigned-dragon?offset=${offset}&limit=${limit}`);
  };

  assignDragonToJob(dragonId: number, jobId: number) {
    return this.requestValidatedResponse(`${apiUrl}job/${jobId}/assigned-dragon/${dragonId}`, 'POST');
  };

  unassignDragonToJob(dragonId: number, jobId: number) {
    return this.requestValidatedResponse(`${apiUrl}job/${jobId}/assigned-dragon/${dragonId}`, 'DELETE');
  };

  getDragonWithJobs(dragonId: number, jobInclusions: JobInclusions) {
    return this.requestValidatedPayload<Dragon>(`${apiUrl}dragon/${dragonId}?jobInclusions=${jobInclusions}`);
  };

  async postDragonForm(dragon: DragonCreateEdit) {
    return await HttpHelpers.submitForm<Dragon, ValidationFailures>(`${apiUrl}dragon`, 'POST', dragon);
  };

  async putDragonForm(dragonId: number, dragon: DragonCreateEdit) {
    return await HttpHelpers.submitForm<Dragon, ValidationFailures>(`${apiUrl}dragon/${dragonId}`, 'PUT', dragon);
  };

  async getJob(jobId: number) {
    return await HttpHelpers.requestValidatedPayload<Job>(`${apiUrl}job/${jobId}`);
  };

  async postJobForm(job: JobCreateEdit) {
    return await HttpHelpers.submitForm<Job, ValidationFailures>(`${apiUrl}job`, 'POST', job);
  };

  async putJobForm(jobId: number, job: JobCreateEdit) {
    return await HttpHelpers.submitForm<Job, ValidationFailures>(`${apiUrl}job/${jobId}`, 'PUT', job);
  };

  async getAllSkills() {
    const limit = 1*1000*1000*1000;
    return await HttpHelpers.getOnePage<SkillTag>(`${apiUrl}skill-tag?offset=0&limit=${limit}`);
  };
}