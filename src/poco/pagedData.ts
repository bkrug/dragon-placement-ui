export default class PagedData<T extends object>
{
    offset: number = 0;
    limit: number = 20;
    totalRecords: number = 0;
    data: T[] = [];
}