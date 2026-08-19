import { Injectable } from '@angular/core';
import { JobInclusions } from '../misc/enums';
import { DragonCreateEdit, JobCreateEdit } from '../poco/endpoint-request-bodies';
import { Dragon, Job, SkillTag } from '../poco/models';
import { ValidationFailures } from '../poco/validation-failures';
import { apiUrl } from './api-url';
import { BaseHttpClient } from './base-http-client';

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

  postDragonForm(dragon: DragonCreateEdit) {
    return this.submitForm<Dragon, ValidationFailures>(`${apiUrl}dragon`, 'POST', dragon);
  };

  putDragonForm(dragonId: number, dragon: DragonCreateEdit) {
    return this.submitForm<Dragon, ValidationFailures>(`${apiUrl}dragon/${dragonId}`, 'PUT', dragon);
  };

  getJob(jobId: number) {
    return this.requestValidatedPayload<Job>(`${apiUrl}job/${jobId}`);
  };

  postJobForm(job: JobCreateEdit) {
    return this.submitForm<Job, ValidationFailures>(`${apiUrl}job`, 'POST', job);
  };

  putJobForm(jobId: number, job: JobCreateEdit) {
    return this.submitForm<Job, ValidationFailures>(`${apiUrl}job/${jobId}`, 'PUT', job);
  };

  getAllSkills() {
    const limit = 1*1000*1000*1000;
    return this.getOnePage<SkillTag>(`${apiUrl}skill-tag?offset=0&limit=${limit}`);
  };
}