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

  public getTemplate = (configId: string, data: Record<string, any>) =>
    request(`${SystemConst.API_BASE}/notifier/template/${configId}/_query`, {
      method: 'POST',
      data,
    });

  public getTemplateVariable = (templateId: string) =>
    request(`${SystemConst.API_BASE}/notifier/template/${templateId}/detail`);

  public getHistoryLog = (configId: string, data: Record<string, any>) =>
    request(`${SystemConst.API_BASE}/notify/history/config/${configId}/_query`, {
      method: 'POST',
      data,
    });

  public debug = (id: string, templateId: string, data: Record<string, any>) =>
    request(`${SystemConst.API_BASE}/notifier/${id}/${templateId}/_send`, {
      method: 'POST',
      data,
    });

  syncUser = {
    dingTalkDept: (configId: string) =>
      request(`${SystemConst.API_BASE}/notifier/dingtalk/corp/${configId}/departments/tree`),
    dingTalkUser: (configId: string, departmentId: string) =>
      request(`${SystemConst.API_BASE}/notifier/dingtalk/corp/${configId}/${departmentId}/users`),
    wechatDept: (configId: string) =>
      request(`${SystemConst.API_BASE}/notifier/wechat/corp/${configId}/departments`),
    getDeptUser: (type: 'wechat' | 'dingTalk', configId: string, departmentId: string) =>
      request(`${SystemConst.API_BASE}/notifier/${type}/corp/${configId}/${departmentId}/users`, {
        method: 'GET',
      }),
    wechatUser: (configId: string, departmentId: string) =>
      request(`${SystemConst.API_BASE}/notifier/wechat/corp/${configId}/${departmentId}/users`),
    bindInfo: (type: string, provider: string, configId: string) =>
      request(`${SystemConst.API_BASE}/user/third-party/${type}_${provider}/${configId}`),
    noBindUser: (data: any) =>
      request(`${SystemConst.API_BASE}/user/_query/no-paging`, {
        method: 'POST',
        data,
      }),
    bindUser: (
      type: string,
      provider: string,
      configId: string,
      data: { userId: string; providerName: string; thirdPartyUserId: string }[],
    ) =>
      request(`${SystemConst.API_BASE}/user/third-party/${type}_${provider}/${configId}`, {
        method: 'PATCH',
        data,
      }),
    getUserBindInfo: () =>
      request(`${SystemConst.API_BASE}/user/third-party/me`, { method: 'GET' }),
    unBindUser: (bindId: string) =>
      request(`${SystemConst.API_BASE}/user/third-party/me/${bindId}`, {
        method: 'DELETE',
      }),
  };
}

export default Service;
