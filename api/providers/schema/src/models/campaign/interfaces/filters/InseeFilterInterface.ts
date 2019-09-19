export interface InseeFilterInterface {
  insee: {
    whitelist: {
      and: {
        start: string[];
        end: string[];
      };
      or: {
        start: string[];
        end: string[];
      };
    };
    blacklist: {
      and: {
        start: string[];
        end: string[];
      };
      or: {
        start: string[];
        end: string[];
      };
    };
  };
}
