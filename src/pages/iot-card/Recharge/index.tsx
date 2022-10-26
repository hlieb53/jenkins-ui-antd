import { PermissionButton } from '@/components';
import SearchComponent from '@/components/SearchComponent';
import useDomFullHeight from '@/hooks/document/useDomFullHeight';
import { ExclamationCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType, ProColumns } from '@jetlinks/pro-table';
import { Tooltip } from 'antd';
import moment from 'moment';
import { useRef, useState } from 'react';
import Service from '../CardManagement/service';
import TopUp from './topUp';

export const service = new Service('');

const Recharge = () => {
  const { minHeight } = useDomFullHeight(`.record`, 24);
  const actionRef = useRef<ActionType>();
  const [param, setParam] = useState({});
  const [visible, setVisible] = useState<boolean>(false);

  const columns: ProColumns<any>[] = [
    // {
    //   title: '充值类型',
    //   dataIndex: 'rechargeType',
    //   ellipsis: true,
    //   hideInSearch: true
    // },
    {
      title: '充值金额',
      dataIndex: 'chargeMoney',
      ellipsis: true,
    },
    {
      title: '支付方式',
      dataIndex: 'paymentType',
      ellipsis: true,
    },
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      ellipsis: true,
    },
    {
      title: '支付URL',
      dataIndex: 'url',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '订单时间',
      dataIndex: 'createTime',
      ellipsis: true,
      valueType: 'dateTime',
      render: (_: any, record) => {
        return record.createTime ? moment(record.createTime).format('YYYY-MM-DD HH:mm:ss') : '';
      },
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      align: 'center',
      width: 200,
      hideInSearch: true,
      render: (_, record) => [
        <a
          key="editable"
          onClick={() => {
            console.log(record);
            // setVisible(true);
            // setCurrent(record);
          }}
        >
          <Tooltip title="查看">
            <EyeOutlined />
          </Tooltip>
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <SearchComponent
        field={columns}
        target="record"
        onSearch={(data) => {
          // 重置分页数据
          actionRef.current?.reset?.();
          setParam(data);
        }}
      />
      <ProTable
        actionRef={actionRef}
        params={param}
        columns={columns}
        search={false}
        rowKey="id"
        tableClassName={'record'}
        columnEmptyText={''}
        tableStyle={{ minHeight }}
        headerTitle={
          <>
            <PermissionButton
              onClick={() => {
                setVisible(true);
              }}
              isPermission={true}
              key="button"
              type="primary"
            >
              充值
            </PermissionButton>
            <div
              style={{
                paddingLeft: 24,
                background: '#fff',
                fontSize: 14,
              }}
            >
              <span style={{ marginRight: 8, fontSize: 16 }}>
                <ExclamationCircleOutlined />
              </span>
              本平台仅提供充值入口，具体充值结果需以运营商的充值结果为准
            </div>
          </>
        }
        // request={async (params) =>
        //   service.getList({ ...params, sorts: [{ name: 'createTime', order: 'desc' }] })
        // }
      />
      {visible && (
        <TopUp
          data={{}}
          close={() => {
            setVisible(false);
          }}
        />
      )}
    </PageContainer>
  );
};
export default Recharge;
