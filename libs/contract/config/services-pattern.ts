type ServiceName = 'users';
// | 'auth' | 'products' | 'orders';

export enum Functionalities {
  CREATE = 'create',
  UPDATE = 'update',
  FIND_ONE = 'find_one',
  FIND_ALL = 'find_all',
  DELETE = 'delete',
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
    [Functionalities.DELETE]: 'users.delete',
  },

  //   auth: {
  //     [Functionalities.CREATE]: 'auth.create',
  //     [Functionalities.UPDATE]: 'auth.update',
  //     [Functionalities.FIND_ONE]: 'auth.find_one',
  //     [Functionalities.FIND_ALL]: 'auth.find_all',
  //     [Functionalities.DELETE]: 'auth.delete',
  //   },
};
