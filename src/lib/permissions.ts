export const PERMISSIONS = {
  CAN_VIEW_DASHBOARD: "CAN_VIEW_DASHBOARD",
  CAN_EDIT_GANTT: "CAN_EDIT_GANTT",
  CAN_MANAGE_PROJECTS: "CAN_MANAGE_PROJECTS",
  CAN_MANAGE_TEAM: "CAN_MANAGE_TEAM",
  CAN_MANAGE_USERS: "CAN_MANAGE_USERS",
  CAN_MANAGE_ROLES: "CAN_MANAGE_ROLES",
  CAN_MANAGE_TECHNOLOGIES: "CAN_MANAGE_TECHNOLOGIES",
  CAN_VIEW_REQUESTS: "CAN_VIEW_REQUESTS",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_LABELS: Record<Permission, string> = {
  CAN_VIEW_DASHBOARD: "Voir le dashboard",
  CAN_EDIT_GANTT: "Modifier le Gantt",
  CAN_MANAGE_PROJECTS: "Gerer les projets",
  CAN_MANAGE_TEAM: "Gerer l'equipe",
  CAN_MANAGE_USERS: "Gerer les utilisateurs",
  CAN_MANAGE_ROLES: "Gerer les roles",
  CAN_MANAGE_TECHNOLOGIES: "Gerer les technologies",
  CAN_VIEW_REQUESTS: "Voir les demandes",
};

export function parsePermissions(json: string): Permission[] {
  try {
    return JSON.parse(json) as Permission[];
  } catch {
    return [];
  }
}
