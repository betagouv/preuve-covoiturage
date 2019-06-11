export interface MailjetConfigInterface {
  public: string;
  private: string;
  email: string;
  name: string;
  template: string;
  debugEmail?: string;
  debugFullname?: string;
}

export interface MailjetConnectOptionsInterface {
  version: string;
  perform_api_call: boolean;
}
