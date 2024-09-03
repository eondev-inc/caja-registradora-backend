export interface IPaginateParams {
  data: any;
  total: number;
  page: number;
  limit: number;
}

export interface IGetQuerysOfPaginationParams {
  query: any;
  page?: number;
  limit?: number;
}
