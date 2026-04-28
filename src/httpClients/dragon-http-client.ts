import { Injectable } from '@angular/core';
import PagedData from '../poco/pagedData';
import { Dragon } from '../poco/dragon';

@Injectable({
  providedIn: 'root',
})
export class DragonHttpClient {
  async getOnePage(jobId: number, offset: number, limit: number) {
    const response = await fetch(`http://localhost:5193/dragon?jobId=${jobId}&offset=${offset}&limit=${limit}`);
    const json = await response.json();
    let source = json as PagedData<Dragon>;
    return {
      offset: source.offset,
      limit: source.limit,
      totalRecords: source.totalRecords,
      data: source.data
    }
  }  
}
