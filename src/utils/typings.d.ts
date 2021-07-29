export type Response<T> = {
  message: 'success' | 'error';
  result:
    | {
        pageIndex: number;
        pageSize: number;
        total: number;
        data: T[];
      }
    | Record<string, any>;
  status: number;
  timestamp: number;
};
