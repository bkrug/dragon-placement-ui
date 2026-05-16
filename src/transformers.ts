import { Job, DisplayJob, Dragon, DisplayDragon, Assignment, DisplayAssignment } from './poco/models';

export const mapJobToDisplayJob = (source: Job) => {
  const startDate = new Date(source.startDateUnix * 1000);
  const endDate = new Date(source.endDateUnix * 1000);
  const openPositions = source.numberOfPositions - source.filledPositions;
  const openDescription =
    openPositions === 0 ? 'Filled'
    : openPositions < 0 ? `${openPositions} of ${source.numberOfPositions} (overfilled)`
    : `${openPositions} of ${source.numberOfPositions}`;
  return {
    jobId: source.jobId,
    jobTitle: source.jobTitle,
    employerName: source.employerName,
    numberOfPositions: source.numberOfPositions,
    openPositions: openPositions,
    openDescription: openDescription,
    startDate: startDate,
    endDate: endDate
  } as DisplayJob;
};

export const mapDragonToDisplayDragon = (source: Dragon) => {
  return {
    dragonId: source.dragonId,
    givenName: source.givenName,
    familyName: source.familyName,
    canBreathFire: source.canBreathFire,
    canTakePassengers: source.canTakePassengers,
    weightInKg: source.weightInKg,
    lengthInMeters: source.lengthInMeters,
    fightingSkills: source.fightingSkills,
    assignments: source.assignments.map(mapAssigmentToDisplayAssignment)
  } as DisplayDragon
}

export const mapAssigmentToDisplayAssignment = (source: Assignment) => {
  const startDate = new Date(source.startDateUnix * 1000);
  const endDate = source.endDateUnix == null ? null : new Date(source.endDateUnix * 1000);
  return {
    assignmentId: source.assignmentId,
    jobId: source.jobId,
    dragonId: source.dragonId,
    startDate: startDate,
    endDate: endDate,
    job: mapJobToDisplayJob(source.job)
  } as DisplayAssignment;
};