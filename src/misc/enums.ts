export enum JobInclusions {
  None = 0,
  CurrentAndFuture,
  Past,
  All
}

export enum DragonTableType {
  AllDragons = 0,
  Candidates = 1,
  AlreadyAssigned = 2
}

export enum WorkRequestStatus {
  Unspecified = 0,
  Draft,
  Approved,
  Completed
}