import { observer } from '@formily/react';
import { Button, Space, Tabs } from 'antd';
import BaseMetadata from '@/pages/device/Product/Detail/Metadata/Base';
import { useIntl } from '@@/plugin-locale/localeExports';
import Import from '@/pages/device/Product/Detail/Metadata/Import';
import { useState } from 'react';

const Metadata = observer(() => {
  const intl = useIntl();
  const [visible, setVisible] = useState<boolean>(false);
  return (
    <>
      <Tabs
        tabBarExtraContent={
          <Space>
            <Button onClick={() => setVisible(true)}>
              {intl.formatMessage({
                id: 'pages.device.productDetail.metadata.quickImport',
                defaultMessage: '快速导入',
              })}
            </Button>
            <Button>
              {intl.formatMessage({
                id: 'pages.device.productDetail.metadata',
                defaultMessage: '物模型',
              })}
              TSL
            </Button>
          </Space>
        }
        destroyInactiveTabPane
      >
        <Tabs.TabPane
          tab={intl.formatMessage({
            id: 'pages.device.productDetail.metadata.propertyDefinition',
            defaultMessage: '属性定义',
          })}
          key="properties"
        >
          <BaseMetadata type={'properties'} />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={intl.formatMessage({
            id: 'pages.device.productDetail.metadata.functionDefinition',
            defaultMessage: '功能定义',
          })}
          key="functions"
        >
          <BaseMetadata type={'functions'} />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={intl.formatMessage({
            id: 'pages.device.productDetail.metadata.eventDefinition',
            defaultMessage: '事件定义',
          })}
          key="events"
        >
          <BaseMetadata type={'events'} />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={intl.formatMessage({
            id: 'pages.device.productDetail.metadata.tagDefinition',
            defaultMessage: '标签定义',
          })}
          key="tags"
        >
          <BaseMetadata type={'tags'} />
        </Tabs.TabPane>
      </Tabs>
      <Import visible={visible} close={() => setVisible(false)} />
    </>
  );
});
export default Metadata;
