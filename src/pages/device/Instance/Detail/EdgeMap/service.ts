import BaseService from '@/utils/BaseService';
import { request } from 'umi';
import SystemConst from '@/utils/const';

class Service extends BaseService<any> {
  restPassword = (deviceId: string, data?: any) =>
    request(
      `/${SystemConst.API_BASE}/edge/operations/${deviceId}/auth-user-password-reset/invoke`,
      {
        method: 'POST',
        data,
      },
    );
  edgeChannel = (deviceId: string, data?: any) =>
    request(
      `/${SystemConst.API_BASE}/edge/operations/${deviceId}/data-collector-channel-list/invoke`,
      {
        method: 'POST',
        data,
      },
    );
  edgeCollector = (deviceId: string, data?: any) =>
    request(`/${SystemConst.API_BASE}/edge/operations/${deviceId}/data-collector-list/invoke`, {
      method: 'POST',
      data,
    });
  edgePoint = (deviceId: string, data?: any) =>
    request(
      `/${SystemConst.API_BASE}/edge/operations/${deviceId}/data-collector-point-list/invoke`,
      {
        method: 'POST',
        data,
      },
    );
  getMap = (deviceId: string, data?: any) =>
    request(`/${SystemConst.API_BASE}/edge/operations/${deviceId}/device-collector-list/invoke`, {
      method: 'POST',
      data,
    });
  removeMap = (deviceId: string, data?: any) =>
    request(`/${SystemConst.API_BASE}/edge/operations/${deviceId}/device-collector-delete/invoke`, {
      method: 'POST',
      data,
    });
  treeMap = (deviceId: string, data?: any) =>
    request(
      `/${SystemConst.API_BASE}/edge/operations/${deviceId}/data-collector-channel-tree/invoke`,
      {
        method: 'POST',
        data,
      },
    );
  saveMap = (deviceId: string, data?: any) =>
    request(`/${SystemConst.API_BASE}/edge/operations/${deviceId}/device-collector-save/invoke`, {
      method: 'POST',
      data,
    });
  getProductListNoPage = (params?: any) =>
    request(`/${SystemConst.API_BASE}/device/product/_query/no-paging?paging=false`, {
      method: 'POST',
      data: params,
    });
  addDevice = (params: any) =>
    request(`/${SystemConst.API_BASE}/device-instance`, {
      method: 'POST',
      data: params,
    });
  editDevice = (params: any) =>
    request(`/${SystemConst.API_BASE}/device-instance`, {
      method: 'PATCH',
      data: params,
    });
}

export default Service;
