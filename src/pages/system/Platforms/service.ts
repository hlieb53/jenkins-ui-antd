import BaseService from '@/utils/BaseService';
import { request } from 'umi';
import SystemConst from '@/utils/const';

class Service extends BaseService<platformsType> {
  queryRoleList = (params?: any) =>
    request(`/${SystemConst.API_BASE}/role/_query/no-paging?paging=false`, {
      method: 'GET',
      params,
    });

  getDetail = (id: string) => request(`${this.uri}/${id}`, { method: 'GET' });

  edit = (data: any) => request(`${this.uri}/${data.id}`, { method: 'PUT', data });

  /**
   * 密码校验
   * @param type
   * @param name
   */
  validateField = (type: 'username' | 'password', name: string) =>
    request(`/${SystemConst.API_BASE}/user/${type}/_validate`, {
      method: 'POST',
      data: name,
    });

  passwordReset = (id: string, data: any) =>
    request(`/${SystemConst.API_BASE}/user/${id}/password/_reset`, {
      method: 'POST',
      data,
    });

  undeploy = (id: string) => request(`${this.uri}/${id}/disable`, { method: 'PUT' });

  deploy = (id: string) => request(`${this.uri}/${id}/enable`, { method: 'PUT' });

  getApiFirstLevel = () =>
    request(`/${SystemConst.API_BASE}/v3/api-docs/swagger-config`, { method: 'GET' });

  getApiNextLevel = (name: string) =>
    request(`/${SystemConst.API_BASE}/v3/api-docs/${name}`, { method: 'GET' });

  /**
   * 对接口进行授权
   * @param id 第三方平台的ID
   * @param data
   */
  saveApiGrant = (id: string, data: any) =>
    request(`/${SystemConst.API_BASE}/application/${id}/grant`, { method: 'POST', data });

  addApiGrant = (id: string, data: any) =>
    request(`/${SystemConst.API_BASE}/application/${id}/grant/_add`, { method: 'POST', data });

  removeApiGrant = (id: string, data: any) =>
    request(`/${SystemConst.API_BASE}/application/${id}/grant/_delete`, { method: 'POST', data });

  /**
   * 获取已授权的接口ID
   * @param id 第三方平台的ID
   */
  getApiGranted = (id: string) =>
    request(`/${SystemConst.API_BASE}/application/${id}/granted`, { method: 'GET' });

  /**
   * 获取可授权的接口ID
   */
  apiOperations = () =>
    request(`/${SystemConst.API_BASE}/application/operations`, { method: 'GET' });

  /**
   * 新增可授权的接口ID
   */
  apiOperationsAdd = (data?: any) =>
    request(`/${SystemConst.API_BASE}/application/operations/_batch`, {
      method: 'PATCH',
      data: data || [],
    });

  /**
   * 删除可授权的接口ID
   */
  apiOperationsRemove = (data?: any) =>
    request(`/${SystemConst.API_BASE}/application/operations/_batch`, {
      method: 'DELETE',
      data: data || [],
    });

  /**
   * 获取可授权的接口ID
   */
  getSdk = () => request(`${this.uri}/sdk`, { method: 'GET' });
}

export default Service;
