import { useRef, useState } from 'react';
import SearchComponent from '@/components/SearchComponent';
import { ProTableCard } from '@/components';
import { ActionType, ProColumns } from '@jetlinks/pro-table';
import { queryMessageTemplatePaging } from '../service';
import { ExtraNoticeTemplateCard } from '@/components/ProTableCard/CardItems/noticeTemplate';
import { observer } from '@formily/react';
import { NotifyModel } from './index';

export default observer(() => {
  const actionRef = useRef<ActionType>();
  const [searchParam, setSearchParam] = useState({});

  const columns: ProColumns<TemplateItem>[] = [
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
      <SearchComponent<TemplateItem>
        field={columns}
        enableSave={false}
        model={'simple'}
        onSearch={async (data) => {
          actionRef.current?.reset?.();
          setSearchParam(data);
        }}
        target="scene-notify-template"
      />
      <div
        style={{
          height: 'calc(100vh - 440px)',
          overflowY: 'auto',
        }}
      >
        <ProTableCard<TemplateItem>
          actionRef={actionRef}
          columns={columns}
          rowKey="id"
          onlyCard={true}
          search={false}
          gridColumn={2}
          columnEmptyText={''}
          cardRender={(record) => (
            <ExtraNoticeTemplateCard
              showBindBtn={false}
              showTool={false}
              cardType={'bind'}
              {...record}
            />
          )}
          tableAlertRender={false}
          rowSelection={{
            type: 'radio',
            selectedRowKeys: [NotifyModel.notify?.templateId || ''],
            onChange: (selectedRowKeys) => {
              if (selectedRowKeys.length) {
                NotifyModel.notify.templateId = String(selectedRowKeys[selectedRowKeys.length - 1]);
              }
            },
          }}
          request={async (params) => {
            const resp = await queryMessageTemplatePaging(NotifyModel.notify?.notifierId || '', {
              ...params,
              sorts: [{ name: 'createTime', order: 'desc' }],
            });
            return {
              code: resp.message,
              result: {
                data: resp.result ? resp.result : [],
                pageIndex: 0,
                pageSize: resp.result.length,
                total: resp.result.length,
              },
              status: resp.status,
            };
          }}
          params={searchParam}
          height={'none'}
        />
      </div>
    </div>
  );
});
