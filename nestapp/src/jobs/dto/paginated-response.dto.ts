
// src/dto/paginated-response.dto.ts
export class PaginatedResponseDto<T> {
  data: T[];
  total: number  ;
  totalPages :number;
  currentPage : number  ;
}
