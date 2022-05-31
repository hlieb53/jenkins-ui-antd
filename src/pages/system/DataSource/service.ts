import BaseService from '@/utils/BaseService';
import SystemConst from '@/utils/const';
import { request } from '@@/plugin-request/request';

class Service extends BaseService<DataSourceItem> {
  changeStatus = (id: string, status: 'disable' | 'enable') =>
    request(`${this.uri}/${id}/_${status}`, { method: 'PUT' });

  getType = () => request(`${this.uri}/types`, { method: 'GET' });

  rdbTree = (datasourceId: string) =>
    request(`${SystemConst.API_BASE}/datasource/rdb/${datasourceId}/tables?includeColumns=false`, {
      method: 'GET',
    });

  rdbTables = (datasourceId: string, table: string, data: any) =>
    request(`/jetlinks/datasource/rdb/${datasourceId}/table/${table}`, {
      method: 'GET',
      params: data,
    });
}

export default Service;
