export type NotificationConfigurationType = {
  mail: {
    debug: boolean;
    driver: string;
    driverOptions: { [key: string]: any };
    sendOptions: { [key: string]: any };
    from: {
      name: string;
      email: string;
    };
    defaultSubject: string;
    to?: {
      name: string;
      email: string;
    };
  };
};
