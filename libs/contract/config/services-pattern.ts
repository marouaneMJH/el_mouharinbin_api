type ServiceName = 'users' | 'auth';
// Ajoute d'autres services ici si besoin

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
  LOGIN = 'login',
}

// Liste des fonctionnalités par service
const serviceFunctionalities: Record<ServiceName, Functionalities[]> = {
  users: [
    Functionalities.CREATE,
    Functionalities.UPDATE,
    Functionalities.FIND_ONE,
    Functionalities.FIND_ALL,
    Functionalities.FIND_BY_EMAIL,
    Functionalities.FIND_BY_ROLE,
    Functionalities.FIND_BY_STATUS,
    Functionalities.DELETE,
    Functionalities.ASSIGN_ROLE,
    Functionalities.REMOVE_ROLE,
    Functionalities.COUNT,
    Functionalities.VERIFY_PASSWORD,
    Functionalities.EXISTS,
    Functionalities.GET_ROLES,
    Functionalities.DEACTIVATE,
    Functionalities.ACTIVATE,
    Functionalities.SUSPEND,
    Functionalities.CHANGE_STATUS,
    Functionalities.UPDATE_LAST_LOGIN,
    Functionalities.GET_ACTIVE_USERS,
    Functionalities.GET_PENDING_USERS,
  ],
  auth: [Functionalities.LOGIN],
};

// Pattern dynamic generator type-safe
export const servicesPattern = new Proxy({}, {
  get: (_, service: ServiceName) => {
    const funcs = serviceFunctionalities[service];
    if (!funcs) throw new Error(`Service ${service} inconnu`);

    return new Proxy({}, {
      get: (_, func: Functionalities) => {
        if (!funcs.includes(func)) {
          throw new Error(`Fonctionnalité ${func} non définie pour ${service}`);
        }
        return `${service}.${func}`;
      }
    });
  }
}) as {
  [K in ServiceName]: {
    [F in Functionalities]?: `${K}.${F}`;
  };
};

// // --- Exemple d'utilisation ---
// const createUserPattern = Services.users.CREATE; // "users.create"
// const loginPattern = Services.auth.LOGIN;        // "auth.login"
