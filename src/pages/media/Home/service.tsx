import BaseService from '@/utils/BaseService';
import { request } from 'umi';
import type { DeviceItem } from '@/pages/media/Device/typings';

class Service extends BaseService<DeviceItem> {
  deviceCount = (data?: any) => request(`${this.uri}/device/_count`, { methods: 'GET', params: data });

  channelCount = (data: any = {}) =>
    request(`${this.uri}/channel/_count`, { method: 'POST', data: data });
}

export default Service;
