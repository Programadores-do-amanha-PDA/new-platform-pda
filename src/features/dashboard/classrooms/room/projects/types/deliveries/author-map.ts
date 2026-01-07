import { ClassroomProjectDelivery, ClassProjectCorrection } from "..";

/**
 * Represents an author or squad in the project delivery system
 * 
 * For individual projects (mini_project), this represents a single author.
 * For group projects, this represents a squad with multiple members.
 */
export interface AuthorMapEntryT {
  /** Unique identifier for the author or squad */
  authorId: string;
  
  /** Array of member IDs for group projects (undefined for individual projects) */
  memberIds?: string[];
  
  /** All deliveries associated with this author or squad */
  deliveries: ClassroomProjectDelivery[];
  
  /** All corrections associated with this author's or squad's deliveries */
  corrections: ClassProjectCorrection[];
}

/**
 * Type alias for the Map structure used to organize authors/squads
 */
export type AuthorMapT = Map<string, AuthorMapEntryT>;