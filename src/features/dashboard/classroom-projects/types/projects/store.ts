import { ClassroomProjectT } from ".";

export interface ProjectStoreStateT {
  projects: ClassroomProjectT[];
  loading: boolean;
}