export interface UserRepositoryListFiltersInterface {
  territory?: string;
  operator?: string;
}

export interface UserRepositoryListPaginationInterface {
  skip?: number;
  limit?: number;
}
