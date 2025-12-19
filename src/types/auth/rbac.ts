import { Role } from "./user-role";

export type Permission = 
  | `classrooms.${string}` 
  | `classroom_projects.${string}`
  | `users.${string}`;

/**
 * Mapeia roles para suas rotas acessíveis e layouts
 */
export const ROLE_CONFIG: Record<Role, {
  allowedRoutes: string[];
  layout: 'admin' | 'student' | 'guest';
  initialDataToLoad: string[];
}> = {
  admin: {
    allowedRoutes: ['/dashboard', '/classrooms', '/users', '/settings'],
    layout: 'admin',
    initialDataToLoad: ['classrooms', 'users', 'projects', 'zoom']
  },
  student: {
    allowedRoutes: ['/dashboard', '/classrooms', '/profile'],
    layout: 'student',
    initialDataToLoad: ['classrooms', 'projects']
  },
  teacher: {
    allowedRoutes: ['/dashboard', '/classrooms', '/classrooms/[id]'],
    layout: 'admin',
    initialDataToLoad: ['classrooms', 'projects']
  },
  guest: {
    allowedRoutes: ['/sign-in', '/signup'],
    layout: 'guest',
    initialDataToLoad: []
  }
};