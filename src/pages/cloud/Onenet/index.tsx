import { PageContainer } from '@ant-design/pro-layout';
import BaseService from '@/utils/BaseService';
import {useIntl} from '@@/plugin-locale/localeExports';
import {useRef} from 'react';
import { ActionType, ProColumns } from '@jetlinks/pro-table';
import { message, Popconfirm, Tooltip } from 'antd';
import { CloseCircleOutlined, EditOutlined, MinusOutlined, PlayCircleOutlined } from '@ant-design/icons';
import BaseCrud from '@/components/BaseCrud';
import { CurdModel } from '@/components/BaseCrud/model';

export const service = new BaseService<OnenetItem>('one-net/product');

const stateIconMap = {
  enabled: <CloseCircleOutlined />,
  disabled: <PlayCircleOutlined />,
};

const Onenet = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const columns: ProColumns<OnenetItem>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
      {
          title: '名称',
          align: 'center',
          dataIndex: 'name'
      },
      {
          title: '状态',
          align: 'center',
          dataIndex: 'state.text',
      },
      {
          title: '说明',
          align: 'center',
          dataIndex: 'description',
      },
      {
        title: intl.formatMessage({
          id:'pages.data.option',
          defaultMessage: '',
        }),
        valueType: 'option',
        align: 'center',
        width: 200,
        render: (text, record) => [
          <a key="editable" onClick={() => CurdModel.update(record)}>
            <Tooltip
              title={intl.formatMessage({
                id: 'pages.data.option.edit',
                defaultMessage: '编辑',
              })}
            >
              <EditOutlined />
            </Tooltip>
          </a>,
          <a key="status">
            <Popconfirm
              title={intl.formatMessage({
                id: `pages.data.option.${
                  record.state.value === 'disabled' ? 'enabled' : 'disabled'
                }.tips`,
                defaultMessage: `确认${record.state.value === 'disabled' ? '启' : '禁'}用？`,
              })}
              onConfirm={async () => {
                const state = record.state.value === 'disabled' ? 'enable' : 'disable';
                await service.changeStatus(record.id, state);
                message.success(
                  intl.formatMessage({
                    id: 'pages.data.option.success',
                    defaultMessage: '操作成功!',
                  }),
                );
                actionRef.current?.reload();
              }}
            >
              <Tooltip
                title={intl.formatMessage({
                  id: `pages.data.option.${
                    record.state.value === 'enabled' ? 'disabled' : 'enabled'
                  }`,
                  defaultMessage: record.state.text,
                })}
              >
                {stateIconMap[record.state.value]}
              </Tooltip>
            </Popconfirm>
          </a>,
             <a>
             <Tooltip
               title={intl.formatMessage({
                 id: 'pages.data.option.remove',
                 defaultMessage: '删除',
               })}
             >
               <MinusOutlined/>
             </Tooltip>
           </a>,
        ],
      },
  ];
  const schema = {};
  return (
    <PageContainer>
      <BaseCrud<OnenetItem>
        columns={columns}
        service={service}
        title={intl.formatMessage({
          id: 'pages.cloud.onenet',
          defaultMessage: 'Onenet',
        })}
        schema={schema}
        actionRef={actionRef}
      />
    </PageContainer>
  );
};
export default Onenet;
