import { request } from 'umi';
import SystemConst from '@/utils/const';

class Service {
  public queryView = () =>
    request(`/${SystemConst.API_BASE}/user/settings/view`, {
      method: 'GET',
    });

  public setView = (data: Record<string, any>) =>
    request(`/${SystemConst.API_BASE}/user/settings/view`, {
      method: 'POST',
      data,
    });
  // 设备数量
  deviceCount = (data?: any) =>
    request(`/${SystemConst.API_BASE}/device/instance/_count`, { methods: 'GET', params: data });
  // 产品数量
  productCount = (data?: any) =>
    request(`/${SystemConst.API_BASE}/device-product/_count`, {
      method: 'POST',
      data,
    });
  userDetail = () =>
    request(`/${SystemConst.API_BASE}/user/detail`, {
      method: 'GET',
    })
  apiDetail = (data:any) =>
    request(`/${SystemConst.API_BASE}/api-client/_query`, {
      method: 'POST',
      data,
    });
}

export default Service;
