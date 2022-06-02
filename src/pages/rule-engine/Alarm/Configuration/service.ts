import BaseService from '@/utils/BaseService';
import { request } from 'umi';
import SystemConst from '@/utils/const';

class Service extends BaseService<ConfigItem> {
  public getTargetTypes = () =>
    request(`/${SystemConst.API_BASE}/alarm/config/target-type/supports`, {
      method: 'GET',
    }).then((resp) => {
      return resp.result.map((item: { id: string; name: string }) => ({
        label: item.name,
        value: item.id,
      }));
    });

  public getScene = (params: Record<string, any>) =>
    request(`/${SystemConst.API_BASE}/scene/_query/no-paging?paging=false`, {
      method: 'GET',
      params,
    });

  public _enable = (id: string) =>
    request(`/${SystemConst.API_BASE}/alarm/config/${id}/_enable`, {
      method: 'POST',
    });

  public _disable = (id: string) =>
    request(`/${SystemConst.API_BASE}/alarm/config/${id}/_disable`, {
      method: 'POST',
    });
  public _execute = (id: string) =>
    request(`/${SystemConst.API_BASE}/scene/${id}/_execute`, {
      method: 'POST',
      data: {},
    });

  public getAlarmCountById = (id: string) =>
    request(`/${SystemConst.API_BASE}/alarm/record/_count`, {
      method: 'POST',
      data: {
        terms: [
          {
            column: 'alarmConfigId',
            value: id,
          },
        ],
      },
    });
  public queryDefaultLevel = () =>
    request(`/${SystemConst.API_BASE}/alarm/config/default/level`, {
      method: 'GET',
    });
}

export default Service;
