import { PageContainer } from '@ant-design/pro-layout';
import type { StreamItem } from '@/pages/media/Stream/typings';
import SearchComponent from '@/components/SearchComponent';
import type { ProColumns } from '@jetlinks/pro-table';
import { Button, Card, Col, Empty, message, Pagination, Popconfirm, Row, Space } from 'antd';
import { useEffect, useState } from 'react';
import Service from '@/pages/media/Stream/service';
import { getMenuPathByParams, MENUS_CODE } from '@/utils/menu';
import { useHistory } from 'umi';
import styles from './index.less';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { model } from '@formily/reactive';

export const service = new Service('media/server');

export const StreamModel = model<{
  current: Partial<StreamItem>;
}>({
  current: {},
});

const Stream = () => {
  const history = useHistory<Record<string, string>>();
  const [param, setParam] = useState<any>({ pageSize: 10, terms: [] });

  const columns: ProColumns<StreamItem>[] = [
    {
      dataIndex: 'name',
      title: '名称',
      ellipsis: true,
    },
    {
      dataIndex: 'description',
      title: '说明',
      ellipsis: true,
    },
  ];

  const [dataSource, setDataSource] = useState<any>({
    data: [],
    pageSize: 10,
    pageIndex: 0,
    total: 0,
  });

  const handleSearch = (params?: any) => {
    service
      .query({
        ...params,
        sorts: [
          {
            name: 'id',
            order: 'desc',
          },
        ],
      })
      .then((resp) => {
        if (resp.status === 200) {
          setDataSource(resp.result);
        }
      });
  };

  useEffect(() => {
    handleSearch(param);
  }, [param]);

  return (
    <PageContainer>
      <SearchComponent<StreamItem>
        field={columns}
        target="stream"
        onSearch={(data) => {
          setParam({
            ...param,
            terms: data?.terms ? [...data?.terms] : [],
          });
        }}
      />
      <Card>
        <Button
          type="primary"
          onClick={() => {
            history.push(`${getMenuPathByParams(MENUS_CODE['media/Stream/Detail'])}`);
            StreamModel.current = {};
          }}
        >
          新增
        </Button>
        {dataSource.data.length > 0 ? (
          <>
            <Row gutter={[16, 16]} style={{ marginTop: 10 }}>
              {(dataSource?.data || []).map((item: any) => (
                <Col key={item.id} span={12}>
                  <Card hoverable>
                    <div className={styles.card}>
                      <div className={styles.header}>
                        <div className={styles.title}>{item?.name}</div>
                        <div className={styles.actions}>
                          <Space>
                            <a
                              onClick={() => {
                                history.push(
                                  `${getMenuPathByParams(
                                    MENUS_CODE['media/Stream/Detail'],
                                    item.id,
                                  )}`,
                                );
                                StreamModel.current = { ...item };
                              }}
                            >
                              <EditOutlined />
                              编辑
                            </a>
                            <Popconfirm
                              title={'确认删除？'}
                              onConfirm={() => {
                                service.remove(item.id).then((resp: any) => {
                                  if (resp.status === 200) {
                                    message.success('操作成功！');
                                    handleSearch({ pageSize: 10, terms: [] });
                                  }
                                });
                              }}
                            >
                              <a>
                                <DeleteOutlined />
                                删除
                              </a>
                            </Popconfirm>
                          </Space>
                        </div>
                      </div>
                      <div className={styles.content}>
                        <div className={styles.item}>
                          <div className={styles.itemTitle}>服务商</div>
                          <p>{item?.provider}</p>
                        </div>
                        <div className={styles.item}>
                          <div className={styles.itemTitle}>RTP IP</div>
                          <p>{item?.configuration?.rtpIp}</p>
                        </div>
                        <div className={styles.item}>
                          <div className={styles.itemTitle}>API HOST</div>
                          <p>{item?.configuration?.apiHost}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
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
                pageSizeOptions={[10, 20, 50, 100]}
                pageSize={dataSource?.pageSize}
                showTotal={(num) => {
                  const minSize = dataSource?.pageIndex * dataSource?.pageSize + 1;
                  const MaxSize = (dataSource?.pageIndex + 1) * dataSource?.pageSize;
                  return `第 ${minSize} - ${MaxSize > num ? num : MaxSize} 条/总共 ${num} 条`;
                }}
              />
            </div>
          </>
        ) : (
          <Empty />
        )}
      </Card>
    </PageContainer>
  );
};
export default Stream;
