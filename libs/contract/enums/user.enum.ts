// libs/contract/enums/user-status.enum.ts
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  DELETED = 'DELETED',
}

// Optional: Helper functions for status management
export const UserStatusHelper = {
  // Get all available statuses
  getAllStatuses: (): UserStatus[] => Object.values(UserStatus),

  // Check if status allows login
  canLogin: (status: UserStatus): boolean => {
    return status === UserStatus.ACTIVE;
  },

  // Check if status is considered active
  isActive: (status: UserStatus): boolean => {
    return status === UserStatus.ACTIVE;
  },

  // Check if status is a soft delete
  isSoftDeleted: (status: UserStatus): boolean => {
    return status === UserStatus.DELETED;
  },

  // Check if user needs activation
  needsActivation: (status: UserStatus): boolean => {
    return status === UserStatus.PENDING;
  },

  // Get user-friendly status labels
  getStatusLabel: (status: UserStatus): string => {
    const labels: Record<UserStatus, string> = {
      [UserStatus.ACTIVE]: 'Active',
      [UserStatus.INACTIVE]: 'Inactive',
      [UserStatus.SUSPENDED]: 'Suspended',
      [UserStatus.PENDING]: 'Pending Activation',
      [UserStatus.DELETED]: 'Deleted',
    };
    return labels[status];
  },

  // Get status descriptions
  getStatusDescription: (status: UserStatus): string => {
    const descriptions: Record<UserStatus, string> = {
      [UserStatus.ACTIVE]: 'User is active and can access the system',
      [UserStatus.INACTIVE]: 'User is temporarily inactive',
      [UserStatus.SUSPENDED]: 'User account has been suspended',
      [UserStatus.PENDING]: 'User account is pending activation',
      [UserStatus.DELETED]: 'User account has been deleted',
    };
    return descriptions[status];
  },

  // Get allowed status transitions
  getAllowedTransitions: (currentStatus: UserStatus): UserStatus[] => {
    const transitions: Record<UserStatus, UserStatus[]> = {
      [UserStatus.PENDING]: [UserStatus.ACTIVE, UserStatus.DELETED],
      [UserStatus.ACTIVE]: [
        UserStatus.INACTIVE,
        UserStatus.SUSPENDED,
        UserStatus.DELETED,
      ],
      [UserStatus.INACTIVE]: [UserStatus.ACTIVE, UserStatus.DELETED],
      [UserStatus.SUSPENDED]: [UserStatus.ACTIVE, UserStatus.DELETED],
      [UserStatus.DELETED]: [], // No transitions from deleted
    };
    return transitions[currentStatus] || [];
  },

  // Check if status transition is valid
  canTransitionTo: (from: UserStatus, to: UserStatus): boolean => {
    const allowedTransitions = UserStatusHelper.getAllowedTransitions(from);
    return allowedTransitions.includes(to);
  },
};
