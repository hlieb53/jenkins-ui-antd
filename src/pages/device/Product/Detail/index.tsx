import { PageContainer } from '@ant-design/pro-layout';
import { history, useParams } from 'umi';
import { Button, Card, Descriptions, Space, Tabs, Badge, message, Spin, Tooltip } from 'antd';
import BaseInfo from '@/pages/device/Product/Detail/BaseInfo';
import { observer } from '@formily/react';
import { productModel, service } from '@/pages/device/Product';
import { useCallback, useEffect, useState } from 'react';
import { useIntl } from '@@/plugin-locale/localeExports';
import Metadata from '@/pages/device/components/Metadata';
import Alarm from '@/pages/device/components/Alarm';
import type { DeviceMetadata } from '@/pages/device/Product/typings';
import { Link } from 'umi';
import { Store } from 'jetlinks-store';
import MetadataAction from '@/pages/device/components/Metadata/DataBaseAction';
import { QuestionCircleOutlined } from '@ant-design/icons';

const ProductDetail = observer(() => {
  const intl = useIntl();

  const statusMap = {
    1: {
      key: 'disable',
      name: '停用',
      action: 'undeploy',
      component: (
        <Badge
          status="processing"
          text={intl.formatMessage({
            id: 'pages.system.tenant.assetInformation.published',
            defaultMessage: '已发布',
          })}
        />
      ),
    },
    0: {
      key: 'enabled',
      name: '启用',
      action: 'deploy',
      component: (
        <Badge
          status="error"
          text={intl.formatMessage({
            id: 'pages.system.tenant.assetInformation.unpublished',
            defaultMessage: '未发布',
          })}
        />
      ),
    },
  };
  const param = useParams<{ id: string }>();

  useEffect(() => {
    if (!productModel.current) {
      history.goBack();
    } else {
      service.getProductDetail(param?.id).subscribe((data) => {
        if (data.metadata) {
          const metadata: DeviceMetadata = JSON.parse(data.metadata);
          MetadataAction.insert(metadata);
        }
      });
    }

    return () => {
      MetadataAction.clean();
    };
  }, [param.id]);

  const [loading, setLoading] = useState<boolean>(false);

  const changeDeploy = useCallback(
    (state: 'deploy' | 'undeploy') => {
      setLoading(true);
      // 似乎没有必要重新获取当前产品信息，暂时做前端数据修改
      service.changeDeploy(param.id, state).subscribe({
        next: async () => {
          const item = productModel.current;
          // 重新应用的话。就不执行更新操作。
          if (item) {
            if (!(item.state === 1 && state === 'deploy')) {
              item.state = item.state > 0 ? item.state - 1 : item.state + 1;
            }
          }
          productModel.current = item;
          message.success('操作成功');
        },
        error: async () => {
          message.success('操作失败');
        },
        complete: () => {
          setLoading(false);
        },
      });
    },
    [param.id],
  );

  useEffect(() => {
    const subscription = Store.subscribe('product-deploy', () => {
      changeDeploy('deploy');
    });
    return subscription.unsubscribe;
  }, [changeDeploy, param.id]);

  return (
    <PageContainer
      onBack={() => history.goBack()}
      extraContent={<Space size={24} />}
      content={
        <Spin spinning={loading}>
          <Descriptions size="small" column={2}>
            <Descriptions.Item
              label={intl.formatMessage({
                id: 'pages.device.category',
                defaultMessage: '产品ID',
              })}
            >
              {productModel.current?.id}
            </Descriptions.Item>
            <Descriptions.Item
              label={intl.formatMessage({
                id: 'pages.table.productName',
                defaultMessage: '产品名称',
              })}
            >
              {productModel.current?.name}
            </Descriptions.Item>
            <Descriptions.Item
              label={intl.formatMessage({
                id: 'pages.device.productDetail.classifiedName',
                defaultMessage: '所属品类',
              })}
            >
              {productModel.current?.classifiedName}
            </Descriptions.Item>
            <Descriptions.Item
              label={intl.formatMessage({
                id: 'pages.device.productDetail.protocolName',
                defaultMessage: '消息协议',
              })}
            >
              {productModel.current?.protocolName}
            </Descriptions.Item>
            <Descriptions.Item
              label={intl.formatMessage({
                id: 'pages.device.productDetail.transportProtocol',
                defaultMessage: '链接协议',
              })}
            >
              {productModel.current?.transportProtocol}
            </Descriptions.Item>
            <Descriptions.Item label={'设备数量'}>
              <Link to={'/device/instance'}> {productModel.current?.count}</Link>
            </Descriptions.Item>
            <Descriptions.Item
              label={intl.formatMessage({
                id: 'pages.device.productDetail.createTime',
                defaultMessage: '创建时间',
              })}
            >
              {productModel.current?.createTime}
            </Descriptions.Item>
          </Descriptions>
        </Spin>
      }
      extra={[
        statusMap[productModel.current?.state || 0].component,
        <Button
          key="2"
          onClick={() => {
            changeDeploy(statusMap[productModel.current?.state || 0].action);
          }}
        >
          {intl.formatMessage({
            id: `pages.device.productDetail.${statusMap[productModel.current?.state || 0].key}`,
            defaultMessage: statusMap[productModel.current?.state || 1].name,
          })}
        </Button>,
        <Button key="1" type="primary" onClick={() => changeDeploy('deploy')}>
          {intl.formatMessage({
            id: 'pages.device.productDetail.setting',
            defaultMessage: '应用配置',
          })}
        </Button>,
      ]}
    >
      <Card>
        <Tabs tabPosition="left" defaultActiveKey="base">
          <Tabs.TabPane
            tab={intl.formatMessage({
              id: 'pages.device.productDetail.base',
              defaultMessage: '配置信息',
            })}
            key="base"
          >
            <BaseInfo />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <Tooltip
                placement="right"
                title={
                  <div>
                    <p>
                      属性：
                      <br />
                      用于描述设备运行时具体信息和状态。
                      例如，环境监测设备所读取的当前环境温度、智能灯开关状态、电风扇风力等级等。
                    </p>
                    功能：
                    <br />
                    <p>
                      指设备可供外部调用的指令或方法。功能调用中可设置输入和输出参数。输入参数是服务执行时的参数，输出参数是服务执行后的结果。
                      相比于属性，功能可通过一条指令实现更复杂的业务逻辑，例如执行某项特定的任务。
                      功能分为异步和同步两种调用方式。
                    </p>
                    <p> 事件：</p>
                    <p>
                      设备运行时，主动上报给云端的信息，一般包含需要被外部感知和处理的信息、告警和故障。事件中可包含多个输出参数。
                      例如，某项任务完成后的通知信息；设备发生故障时的温度、时间信息；设备告警时的运行状态等。
                    </p>
                    <p> 标签：</p>
                    <p>
                      统一为设备添加拓展字段，添加后将在设备信息页显示。可用于对设备基本信息描述的补充。
                    </p>
                  </div>
                }
              >
                {intl.formatMessage({
                  id: 'pages.device.productDetail.metadata',
                  defaultMessage: '物模型',
                })}
                <QuestionCircleOutlined />
              </Tooltip>
            }
            key="metadata"
          >
            <Metadata type="product" />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={intl.formatMessage({
              id: 'pages.device.productDetail.alarm',
              defaultMessage: '告警设置',
            })}
            key="alarm"
          >
            <Alarm type="product" />
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </PageContainer>
  );
});
export default ProductDetail;
