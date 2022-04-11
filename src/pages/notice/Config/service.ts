import BaseService from '@/utils/BaseService';
import { request } from 'umi';
import SystemConst from '@/utils/const';

class Service extends BaseService<ConfigItem> {
  public getTypes = () =>
    request(`${this.uri}/types`, {
      method: 'GET',
    });

  public getMetadata = (type: string, provider: string) =>
    request(`${this.uri}/${type}/${provider}/metadata`, {
      method: 'GET',
    });

  public getTemplate = (configId: string) =>
    request(`${SystemConst.API_BASE}/notifier/template/${configId}/_query/no-paging`);

  public getTemplateVariable = (templateId: string) =>
    request(`${SystemConst.API_BASE}/notifier/template/${templateId}/detail`);
}

export default Service;
