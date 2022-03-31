import { ContainerFilled, ToolFilled } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Card, Col, message, Row } from 'antd';
import dingding from '/public/images/dingding.png';
import styles from './index.less';
import { observer } from '@formily/react';

const Type = observer(() => {
  const list = [
    {
      type: 'dingtalk',
      icon: dingding,
    },
    {
      type: 'weixin',
      icon: dingding,
    },
    {
      type: 'email',
      icon: dingding,
    },
    {
      type: 'voice',
      icon: dingding,
    },
    {
      type: 'sms',
      icon: dingding,
    },
  ];

  return (
    <PageContainer
      title={false}
      // breadcrumbRender={() => {
      //   return <div>通知配置</div>;
      // }}
    >
      <Row gutter={[24, 24]}>
        {list.map((i) => (
          <Col span={12} key={i.type}>
            <Card>
              <Row>
                <Col span={12}>
                  <img style={{ height: 100 }} src={dingding} alt="dingding" />
                </Col>
                <Col span={3} push={4}>
                  <div className={styles.action}>
                    <Button
                      type={'link'}
                      onClick={() => {
                        message.success(i.type);
                      }}
                    >
                      <ContainerFilled className={styles.icon} />
                      <div>通知模版</div>
                    </Button>
                  </div>
                </Col>
                <Col span={3} push={6}>
                  <div className={styles.action}>
                    <Button
                      type={'link'}
                      onClick={() => {
                        message.success(i.type);
                      }}
                    >
                      <ToolFilled className={styles.icon} />
                      <div>通知配置</div>
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>
    </PageContainer>
  );
});
export default Type;
