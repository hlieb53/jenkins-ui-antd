import BaseService from '@/utils/BaseService';
import { request } from 'umi';
import SystemConst from '@/utils/const';

class Service extends BaseService<any> {
  saveMaster = (data: any) =>
    request(`/${SystemConst.API_BASE}/modbus/master`, {
      method: 'POST',
      data,
    });
  editMaster = (id: string, data: any) =>
    request(`/${SystemConst.API_BASE}/modbus/master/${id}`, {
      method: 'PUT',
      data,
    });
  queryMaster = (data: any) =>
    request(`/${SystemConst.API_BASE}/modbus/master/_query/no-paging`, {
      method: 'POST',
      data,
    });
  deleteMaster = (id: string) =>
    request(`/${SystemConst.API_BASE}/modbus/master/${id}`, {
      method: 'DELETE',
    });
  savePoint = (data: any) =>
    request(`/${SystemConst.API_BASE}/modbus/point`, {
      method: 'POST',
      data,
    });
  queryPoint = (masterId: string, data: any) =>
    request(`/${SystemConst.API_BASE}/modbus/point/${masterId}/_query`, {
      method: 'POST',
      data,
    });
  editPoint = (id: string, data: any) =>
    request(`/${SystemConst.API_BASE}/modbus/point/${id}`, {
      method: 'PUT',
      data,
    });
  enablePoint = (data: any) =>
    request(`/${SystemConst.API_BASE}/modbus/point/_enable`, {
      method: 'POST',
      data,
    });
  disablePoint = (data: any) =>
    request(`/${SystemConst.API_BASE}/modbus/point/_disable`, {
      method: 'POST',
      data,
    });
  deletePoint = (id: string) =>
    request(`/${SystemConst.API_BASE}/modbus/point/${id}`, {
      method: 'DELETE',
    });
  //查询modbus点位列表
  getPoint = (data: any) =>
    request(`/${SystemConst.API_BASE}/modbus/point/_query/no-paging`, {
      method: 'POST',
      data,
    });
  //保存设备绑定点位映射配置
  // saveDevicePoint = (deviceId: string, data: any) =>
  //   request(`/${SystemConst.API_BASE}/device/instance/${deviceId}/collector/modbus`, {
  //     method: 'PATCH',
  //     data,
  //   });
  saveDevicePoint = (deviceId: string, data: any) =>
    request(`/${SystemConst.API_BASE}/things/collector/device/${deviceId}/MODBUS_TCP`, {
      method: 'PATCH',
      data,
    });
  //查询设备点位映射配置
  // getDevicePoint = (deviceId: string, param?: string) =>
  //   request(`/${SystemConst.API_BASE}/device/instance/${deviceId}/collector/_query`, {
  //     method: 'GET',
  //     param,
  //   });
  getDevicePoint = (deviceId: string, param?: string) =>
    request(`/${SystemConst.API_BASE}/things/collector/device/${deviceId}/_query`, {
      method: 'GET',
      param,
    });
  //设备解绑点位映射配置
  // removeDevicePoint = (deviceId: string, data: any) =>
  //   request(`/${SystemConst.API_BASE}/device/instance/${deviceId}/collectors/_delete`, {
  //     method: 'POST',
  //     data,
  //   });
  removeDevicePoint = (deviceId: string, data: any) =>
    request(`/${SystemConst.API_BASE}/things/collector/device/${deviceId}/_delete`, {
      method: 'POST',
      data,
    });
  //modbus数据类型
  dataType = () =>
    request(`/${SystemConst.API_BASE}/things/collector/codecs`, {
      method: 'GET',
    });
}

export default Service;
