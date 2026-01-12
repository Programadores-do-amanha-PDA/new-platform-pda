import { ClassroomProjectDelivery, ClassroomProjectCorrection } from "..";

/**
 * Represents an author or squad in the project delivery system
 * 
 * For individual projects (mini_project), this represents a single author.
 * For group projects, this represents a squad with multiple members.
 */
export interface AuthorMapEntryT {
  authorId: string;
  memberIds?: string[];
  deliveries: ClassroomProjectDelivery[];
  corrections: ClassroomProjectCorrection[];
}

/**
 * Type alias for the Map structure used to organize authors/squads
 */
export type AuthorMapT = Map<string, AuthorMapEntryT>;