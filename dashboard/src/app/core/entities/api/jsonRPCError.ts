export class JsonRPCError extends Error {
  code: string;
  data: any;

  constructor(serverResponse?: any) {
    super(serverResponse.message);
    this.code = serverResponse.code;
  }
}
