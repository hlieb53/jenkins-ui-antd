import { useRef, useState } from 'react';
import SearchComponent from '@/components/SearchComponent';
import { ProTableCard } from '@/components';
import { ActionType, ProColumns } from '@jetlinks/pro-table';
import { queryMessageConfigPaging } from '../service';
import { ExtraNoticeConfigCard } from '@/components/ProTableCard/CardItems/noticeConfig';
import { observer } from '@formily/react';
import { NotifyModel } from './index';

interface Props {
  type: string;
}

export default observer((props: Props) => {
  const actionRef = useRef<ActionType>();
  const [searchParam, setSearchParam] = useState({});

  const columns: ProColumns<ConfigItem>[] = [
    {
      dataIndex: 'id',
      title: 'ID',
    },
    {
      dataIndex: 'name',
      title: '名称',
    },
    {
      title: '说明',
      dataIndex: 'description',
    },
  ];

  return (
    <div>
      <SearchComponent<ConfigItem>
        field={columns}
        enableSave={false}
        model={'simple'}
        onSearch={async (data) => {
          actionRef.current?.reset?.();
          setSearchParam(data);
        }}
        target="scene-notify-config"
      />
      <div
        style={{
          height: 'calc(100vh - 440px)',
          overflowY: 'auto',
        }}
      >
        <ProTableCard<ConfigItem>
          actionRef={actionRef}
          columns={columns}
          rowKey="id"
          search={false}
          onlyCard={true}
          gridColumn={2}
          columnEmptyText={''}
          cardRender={(record) => (
            <ExtraNoticeConfigCard
              showBindBtn={false}
              showTool={false}
              cardType={'bind'}
              {...record}
            />
          )}
          tableAlertRender={false}
          rowSelection={{
            type: 'radio',
            selectedRowKeys: [NotifyModel.notify?.notifierId || ''],
            onChange: (selectedRowKeys, list) => {
              if (selectedRowKeys.length) {
                NotifyModel.notify.notifierId = String(selectedRowKeys[selectedRowKeys.length - 1]);
                NotifyModel.notify.templateId = '';
                NotifyModel.variable = [];
                NotifyModel.notify.options = {
                  ...NotifyModel.notify.options,
                  provider: list[list.length - 1]?.provider,
                };
              }
            },
          }}
          request={(params) =>
            queryMessageConfigPaging({
              ...params,
              terms: params?.terms
                ? [
                    ...params?.terms,
                    {
                      terms: [
                        {
                          column: 'type',
                          termType: 'eq',
                          value: NotifyModel.notify?.notifyType || props.type,
                        },
                      ],
                    },
                  ]
                : [
                    {
                      column: 'type',
                      termType: 'eq',
                      value: NotifyModel.notify?.notifyType || props.type,
                    },
                  ],
              sorts: [{ name: 'createTime', order: 'desc' }],
            })
          }
          params={searchParam}
          height={'none'}
        />
      </div>
    </div>
  );
});
