import { useEffect, useState } from 'react';
import { Badge, Button, Col, message, Modal, Pagination, Row } from 'antd';
import { service } from '@/pages/link/AccessConfig';
import { productModel } from '@/pages/device/Product';
import SearchComponent from '@/components/SearchComponent';
import type { ProColumns } from '@jetlinks/pro-table';
import styles from './index.less';
import Service from '@/pages/device/Product/service';
import { TableCard } from '@/components';
import { StatusColorEnum } from '@/components/BadgeStatus';
const defaultImage = require('/public/images/device-access.png');
interface Props {
  close: () => void;
  data?: any;
}

const AccessConfig = (props: Props) => {
  const { close } = props;
  const service1 = new Service('device-product');

  const [dataSource, setDataSource] = useState<any>({
    data: [],
    pageSize: 4,
    pageIndex: 0,
    total: 0,
  });
  const [param, setParam] = useState<any>({ pageSize: 4 });

  const [currrent] = useState<any>({
    id: productModel.current?.accessId,
    name: productModel.current?.accessName,
    protocol: productModel.current?.messageProtocol,
    transport: productModel.current?.transportProtocol,
    protocolDetail: {
      name: productModel.current?.protocolName,
    },
  });

  const handleSearch = (params: any) => {
    setParam(params);
    service
      .queryList({ ...params, sorts: [{ name: 'createTime', order: 'desc' }] })
      .then((resp) => {
        setDataSource(resp.result);
      });
  };

  const columns: ProColumns<any>[] = [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '状态',
      dataIndex: 'state',
      valueType: 'select',
      valueEnum: {
        disabled: {
          text: '已停止',
          status: 'disabled',
        },
        enabled: {
          text: '已启动',
          status: 'enabled',
        },
      },
    },
    {
      title: '说明',
      dataIndex: 'description',
    },
  ];

  useEffect(() => {
    handleSearch(param);
  }, []);

  return (
    <Modal
      onCancel={() => {
        close();
      }}
      visible
      width={1200}
      title={'设备接入配置'}
      onOk={() => {
        if (!!currrent) {
          service1
            .update({
              ...productModel.current,
              transportProtocol: currrent.transport,
              protocolName: currrent.protocolDetail.name,
              accessId: currrent.id,
              accessName: currrent.name,
              messageProtocol: currrent.protocol,
            })
            .then((resp) => {
              if (resp.status === 200) {
                service1.detail(productModel.current?.id || '').then((res) => {
                  if (res.status === 200) {
                    productModel.current = { ...res.result };
                    message.success('操作成功！');
                    close();
                  }
                });
              }
            });
        } else {
          message.success('请选择接入方式');
        }
      }}
    >
      <div className={styles.search}>
        <SearchComponent
          field={columns}
          enableSave={false}
          onSearch={(data: any) => {
            const dt = {
              pageSize: 4,
              terms: [...data.terms],
            };
            handleSearch(dt);
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="primary"
            onClick={() => {
              const tab: any = window.open(`${origin}/#/link/AccessConfig/Detail`);
              tab!.onTabSaveSuccess = (value: any) => {
                if (value.status === 200) {
                  handleSearch(param);
                }
              };
            }}
          >
            新增
          </Button>
        </div>
      </div>
      <Row gutter={[16, 16]}>
        {dataSource.data.map((item: any) => (
          <Col
            key={item.name}
            span={12}
            // style={{
            //   width: '100%',
            //   borderColor: currrent?.id === item.id ? 'var(--ant-primary-color-active)' : ''
            // }}
            // onClick={() => {
            //   setCurrrent(item);
            // }}
          >
            <TableCard
              showMask={false}
              status={item.state.value}
              statusText={item.state.text}
              statusNames={{
                enabled: StatusColorEnum.processing,
                disabled: StatusColorEnum.error,
              }}
            >
              <div className={styles.context}>
                <div>
                  <img width={88} height={88} src={defaultImage} alt={''} />
                </div>
                <div className={styles.card}>
                  <div className={styles.header}>
                    <div className={styles.title}>{item.name || '--'}</div>
                    <div className={styles.desc}>{item.description || '--'}</div>
                  </div>
                  <div className={styles.container}>
                    <div className={styles.server}>
                      <div className={styles.subTitle}>{item?.channelInfo?.name || '--'}</div>
                      <p>
                        {item.channelInfo?.addresses.map((i: any) => (
                          <div key={i.address}>
                            <Badge color={i.health === -1 ? 'red' : 'green'} text={i.address} />
                          </div>
                        ))}
                      </p>
                    </div>
                    <div className={styles.procotol}>
                      <div className={styles.subTitle}>{item?.protocolDetail?.name || '--'}</div>
                      <p>{item.protocolDetail?.description || '--'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TableCard>
          </Col>
        ))}
      </Row>
      <div style={{ display: 'flex', marginTop: 20, justifyContent: 'flex-end' }}>
        <Pagination
          showSizeChanger
          size="small"
          className={'pro-table-card-pagination'}
          total={dataSource?.total || 0}
          current={dataSource?.pageIndex + 1}
          onChange={(page, size) => {
            handleSearch({
              ...param,
              pageIndex: page - 1,
              pageSize: size,
            });
          }}
          pageSizeOptions={[4, 8, 16, 32]}
          pageSize={dataSource?.pageSize}
          showTotal={(num) => {
            const minSize = dataSource?.pageIndex * dataSource?.pageSize + 1;
            const MaxSize = (dataSource?.pageIndex + 1) * dataSource?.pageSize;
            return `第 ${minSize} - ${MaxSize > num ? num : MaxSize} 条/总共 ${num} 条`;
          }}
        />
      </div>
    </Modal>
  );
};
export default AccessConfig;
