import { observer } from '@formily/react';
import { PageContainer } from '@ant-design/pro-layout';
import { useEffect, useState } from 'react';
import { history, useParams } from 'umi';
import TenantModel from '@/pages/system/Tenant/model';
import { service } from '@/pages/system/Tenant';
import Assets from '@/pages/system/Tenant/Detail/Assets';
import Member from '@/pages/system/Tenant/Detail/Member';
import Info from '@/pages/system/Tenant/Detail/Info';
import Permission from './Permission';

const TenantDetail = observer(() => {
  const [tab, setTab] = useState<string>('assets');
  const params = useParams<{ id: string }>();
  const getDetail = (id: string) => {
    service.queryDetail(id).subscribe((data) => {
      TenantModel.detail = data;
    });
  };

  useEffect(() => {
    const { id } = params;
    if (id) {
      getDetail(id);
    } else {
      history.goBack();
    }
  }, [params.id]);

  const list = [
    // {
    //   key: 'detail',
    //   tab: '基本信息',
    //   component: <Info/>
    // },
    {
      key: 'assets',
      tab: '资产信息',
      component: <Assets />,
    },
    {
      key: 'member',
      tab: '成员管理',
      component: <Member />,
    },
    {
      key: 'permission',
      tab: '权限管理',
      component: <Permission />,
    },
  ];

  return (
    <PageContainer onBack={history.goBack} tabList={list} onTabChange={setTab} content={<Info />}>
      {list.find((k) => k.key === tab)?.component}
    </PageContainer>
  );
});
export default TenantDetail;
