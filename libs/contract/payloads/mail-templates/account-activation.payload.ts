import { UserStatus } from '../../enums/user.enum';

export class AccountActivationMailTDto {
  appName: string = 'NO FAP';
  activationStatus: UserStatus = UserStatus.ACTIVE;
  userEmail: string;
  userName: string;
  activationDate?: string;
  activationUrl?: string | null;
  errorMessage: string =
    'The activation link is invalid or has expired. Please try requesting a new activation email';
  loginUrl: string = 'www.google.com';
  resendUrl: string = 'www.google.com';
  supportEmail: string = 'www.google.com';
  currentYear: number = new Date().getFullYear();
  linkExpiry?: string = '24 hours';
  features: string[] = [
    'Track your progress and milestones',
    'Access exclusive community features',
    'Monitor your daily streaks',
    'Get personalized insights and analytics',
  ];

  constructor(init: {
    userEmail: string;
    userName: string;
    loginUrl: string;
    resendUrl: string;
    supportEmail: string;
    activationUrl?: string;
    appName?: string; // Make optional with a default below
    activationStatus?: UserStatus;
  }) {
    // Assign required properties from the init object
    this.userEmail = init.userEmail;
    this.userName = init.userName;
    this.loginUrl = init.loginUrl;
    this.resendUrl = init.resendUrl;
    this.supportEmail = init.supportEmail;
    this.activationUrl = init.activationUrl;

    // Set defaults for optional properties, allowing them to be overridden
    this.appName = init.appName ?? 'NO FAP';
    this.activationStatus = init.activationStatus ?? UserStatus.PENDING;
    this.currentYear = new Date().getFullYear();
    this.linkExpiry = '24 hours';
    this.activationUrl = this.activationUrl ?? 'www.elmoujahid.me';
    this.features = [
      'Track your progress and milestones',
      'Access exclusive community features',
      'Monitor your daily streaks',
      'Get personalized insights and analytics',
    ];
  }
}
