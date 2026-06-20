import { environment } from '../environments/environment';

export const apiUrl = environment.backendApi.endsWith('/')
  ? environment.backendApi
  : environment.backendApi + '/'
