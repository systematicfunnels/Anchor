export type UserRole = 
  | 'Executive' 
  | 'Project Manager' 
  | 'Architect' 
  | 'Developer' 
  | 'QA / Tester' 
  | 'DevOps / Ops' 
  | 'Security / Compliance' 
  | 'Finance' 
  | 'Legal' 
  | 'Auditor' 
  | 'Viewer';

export type AccessLevel = 'FULL' | 'READ_ONLY' | 'NO_ACCESS';

export interface RolePermissions {
  [screenName: string]: AccessLevel;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
}
