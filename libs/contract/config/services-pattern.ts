type ServiceName = 'users';
// | 'auth' | 'products' | 'orders';

export enum Functionalities {
  CREATE = 'create',
  UPDATE = 'update',
  FIND_ONE = 'find_one',
  FIND_ALL = 'find_all',
  FIND_BY_EMAIL = 'find_by_email',
  FIND_BY_ROLE = 'find_by_role',
  FIND_BY_STATUS = 'find_by_status',
  DELETE = 'delete',
  ASSIGN_ROLE = 'assign_role',
  REMOVE_ROLE = 'remove_role',
  COUNT = 'count',
  VERIFY_PASSWORD = 'verify_password',
  EXISTS = 'exists',
  GET_ROLES = 'get_roles',
  DEACTIVATE = 'deactivate',
  ACTIVATE = 'activate',
  SUSPEND = 'suspend',
  CHANGE_STATUS = 'change_status',
  UPDATE_LAST_LOGIN = 'update_last_login',
  GET_ACTIVE_USERS = 'get_active_users',
  GET_PENDING_USERS = 'get_pending_users',
}

export const servicesPattern: Record<
  ServiceName,
  Record<Functionalities, string>
> = {
  users: {
    [Functionalities.CREATE]: 'users.create',
    [Functionalities.UPDATE]: 'users.update',
    [Functionalities.FIND_ONE]: 'users.find_one',
    [Functionalities.FIND_ALL]: 'users.find_all',
    [Functionalities.FIND_BY_EMAIL]: 'users.find_by_email',
    [Functionalities.FIND_BY_ROLE]: 'users.find_by_role',
    [Functionalities.FIND_BY_STATUS]: 'users.find_by_status',
    [Functionalities.DELETE]: 'users.delete',
    [Functionalities.ASSIGN_ROLE]: 'users.assign_role',
    [Functionalities.REMOVE_ROLE]: 'users.remove_role',
    [Functionalities.COUNT]: 'users.count',
    [Functionalities.VERIFY_PASSWORD]: 'users.verify_password',
    [Functionalities.EXISTS]: 'users.exists',
    [Functionalities.GET_ROLES]: 'users.get_roles',
    [Functionalities.DEACTIVATE]: 'users.deactivate',
    [Functionalities.ACTIVATE]: 'users.activate',
    [Functionalities.SUSPEND]: 'users.suspend',
    [Functionalities.CHANGE_STATUS]: 'users.change_status',
    [Functionalities.UPDATE_LAST_LOGIN]: 'users.update_last_login',
    [Functionalities.GET_ACTIVE_USERS]: 'users.get_active_users',
    [Functionalities.GET_PENDING_USERS]: 'users.get_pending_users',
  },
};

// Optional: Type-safe pattern accessor
export const getUsersPattern = () => servicesPattern.users;
