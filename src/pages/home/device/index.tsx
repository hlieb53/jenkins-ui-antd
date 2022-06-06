import { Col, message, Row, Tooltip } from 'antd';
import { PermissionButton } from '@/components';
import { Body, Guide } from '../components';
import Statistics from '../components/Statistics';
import Steps from '../components/Steps';
import { getMenuPathByCode, MENUS_CODE } from '@/utils/menu';
import { useHistory } from '@/hooks';
import { service } from '..';
import { useEffect, useState } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';

const Device = () => {
  const productPermission = PermissionButton.usePermission('device/Product').permission;
  const devicePermission = PermissionButton.usePermission('device/Instance').permission;
  const rulePermission = PermissionButton.usePermission('rule-engine/Instance').permission;

  const [productCount, setProductCount] = useState<number>(0);
  const [deviceCount, setDeviceCount] = useState<number>(0);

  const getProductCount = async () => {
    const resp = await service.productCount({});
    if (resp.status === 200) {
      setProductCount(resp.result);
    }
  };

  const getDeviceCount = async () => {
    const resp = await service.deviceCount();
    if (resp.status === 200) {
      setDeviceCount(resp.result);
    }
  };

  useEffect(() => {
    getProductCount();
    getDeviceCount();
  }, []);

  const history = useHistory();
  // // 跳转

  const guideList = [
    {
      key: 'product',
      name: '创建产品',
      english: 'CREATE PRODUCT',
      auth: !!productPermission.add,
      url: 'device/Product',
      param: {
        save: true,
      },
    },
    {
      key: 'device',
      name: '创建设备',
      english: 'CREATE DEVICE',
      auth: !!devicePermission.add,
      url: 'device/Instance',
      param: {
        save: true,
      },
    },
    {
      key: 'rule-engine',
      name: '规则引擎',
      english: 'RULE ENGINE',
      auth: !!rulePermission.add,
      url: 'rule-engine/Instance',
      param: {
        save: true,
      },
    },
  ];

  return (
    <Row gutter={24}>
      <Col span={14}>
        <Guide
          title="物联网引导"
          data={guideList}
          // jump={(auth: boolean, url: string, param: string) => {
          //   pageJump(auth, url, param);
          // }}
        />
      </Col>
      <Col span={10}>
        <Statistics
          data={[
            {
              name: '产品数量',
              value: productCount,
              children: '',
            },
            {
              name: '设备数量',
              value: deviceCount,
              children: '',
            },
          ]}
          title="设备统计"
          extra={
            <div style={{ fontSize: 14, fontWeight: 400 }}>
              <a
                onClick={() => {
                  const url = getMenuPathByCode(MENUS_CODE['device/DashBoard']);
                  if (!!url) {
                    history.push(`${url}`);
                  } else {
                    message.warning('暂无权限，请联系管理员');
                  }
                }}
              >
                详情
              </a>
            </div>
          }
        />
      </Col>
      <Col span={24}>
        <Body title={'平台架构图'} english={'PLATFORM ARCHITECTURE DIAGRAM'} />
      </Col>
      <Col span={24}>
        <Steps
          title={
            <span>
              设备接入推荐步骤
              <Tooltip title={'不同的设备因为通信协议的不用，存在接入步骤的差异'}>
                <QuestionCircleOutlined style={{ paddingLeft: 12 }} />
              </Tooltip>
            </span>
          }
          data={[
            {
              title: '创建产品',
              content:
                '产品是设备的集合，通常指一组具有相同功能的设备。物联设备必须通过产品进行接入方式配置。',
              onClick: () => {},
            },
            {
              title: '配置产品接入方式',
              content:
                '通过产品对同一类型的所有设备进行统一的接入方式配置。请参照设备铭牌说明选择匹配的接入方式。',
              onClick: () => {},
            },
            {
              title: '添加测试设备',
              content: '添加单个设备，用于验证产品模型是否配置正确。',
              onClick: () => {},
            },
            {
              title: '功能调试',
              content: '对添加的测试设备进行功能调试，验证能否连接到平台，设备功能是否配置正确。',
              onClick: () => {},
            },
            {
              title: '批量添加设备',
              content: '批量添加同一产品下的设备',
              onClick: () => {},
            },
          ]}
        />
      </Col>
    </Row>
  );
};
export default Device;
