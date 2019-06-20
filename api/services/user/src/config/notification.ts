declare function env(key: string, fallback?: string): any;

export const mail = {
  debug: false,
  driver: 'mailjet',
  driverOptions: {
    public: env('MAILJET_PUBLIC_KEY', 'REMOVE ME'),
    private: env('MAILJET_PRIVATE_KEY', 'REMOVE ME'),
  },
  sendOptions: {
    template: 10,
  },
  from: {
    name: '',
    email: '',
  },
  defaultSubject: '',
  to: {
    name: '',
    email: '',
  },
};
