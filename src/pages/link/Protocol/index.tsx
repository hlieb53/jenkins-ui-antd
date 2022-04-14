import { PageContainer } from '@ant-design/pro-layout';
import type { ProtocolItem } from '@/pages/link/Protocol/typings';
import { useEffect, useRef } from 'react';
import type { ActionType, ProColumns } from '@jetlinks/pro-table';
import { Badge, Button, message, Popconfirm, Tooltip } from 'antd';
import { CheckCircleOutlined, DeleteOutlined, EditOutlined, StopOutlined } from '@ant-design/icons';
import BaseCrud from '@/components/BaseCrud';
import { useIntl } from '@@/plugin-locale/localeExports';
import type { ISchema } from '@formily/json-schema';
import { CurdModel } from '@/components/BaseCrud/model';
import Service from '@/pages/link/Protocol/service';
import { onFormValuesChange, registerValidateRules } from '@formily/core';
import { Store } from 'jetlinks-store';
import { useLocation } from 'umi';
import SystemConst from '@/utils/const';
import { getButtonPermission } from '@/utils/menu';

export const service = new Service('protocol');
const Protocol = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();

  const modifyState = async (id: string, type: 'deploy' | 'un-deploy') => {
    const resp = await service.modifyState(id, type);
    if (resp.status === 200) {
      message.success('操作成功!');
    } else {
      message.error('操作失败!');
    }
    actionRef.current?.reload();
  };

  const columns: ProColumns<ProtocolItem>[] = [
    {
      dataIndex: 'id',
      title: 'ID',
      sorter: true,
      ellipsis: true,
      defaultSortOrder: 'ascend',
    },
    {
      dataIndex: 'name',
      ellipsis: true,
      title: intl.formatMessage({
        id: 'pages.table.name',
        defaultMessage: '名称',
      }),
    },
    {
      dataIndex: 'type',
      title: '类型',
      ellipsis: true,
    },
    {
      dataIndex: 'state',
      title: '状态',
      renderText: (text) => (
        <Badge color={text !== 1 ? 'red' : 'green'} text={text !== 1 ? '未发布' : '已发布'} />
      ),
    },
    {
      dataIndex: 'description',
      ellipsis: true,
      title: '说明',
    },
    {
      title: intl.formatMessage({
        id: 'pages.data.option',
        defaultMessage: '操作',
      }),
      valueType: 'option',
      width: 200,
      render: (text, record) => [
        <Button
          type="link"
          style={{ padding: 0 }}
          disabled={getButtonPermission('link/Protocol', ['update'])}
          key="edit"
          onClick={() => {
            CurdModel.update(record);
            CurdModel.model = 'edit';
          }}
        >
          <Tooltip
            title={intl.formatMessage({
              id: 'pages.data.option.edit',
              defaultMessage: '编辑',
            })}
          >
            <EditOutlined />
          </Tooltip>
        </Button>,
        record.state !== 1 && (
          <Button
            type="link"
            style={{ padding: 0 }}
            disabled={getButtonPermission('link/Protocol', ['action'])}
            key="publish"
          >
            <Popconfirm title="确认发布？" onConfirm={() => modifyState(record.id, 'deploy')}>
              <Tooltip title="发布">
                <CheckCircleOutlined />
              </Tooltip>
            </Popconfirm>
          </Button>
        ),
        record.state === 1 && (
          <Button
            type="link"
            style={{ padding: 0 }}
            disabled={getButtonPermission('link/Protocol', ['action'])}
            key="reload"
          >
            <Popconfirm title="确认撤销？" onConfirm={() => modifyState(record.id, 'un-deploy')}>
              <Tooltip title="撤销">
                <StopOutlined />
              </Tooltip>
            </Popconfirm>
          </Button>
        ),
        <Button
          style={{ padding: 0 }}
          key="delete"
          type="link"
          disabled={record.state === 1 || getButtonPermission('link/Protocol', ['delete'])}
        >
          <Tooltip
            key="delete"
            title={
              record.state !== 1
                ? intl.formatMessage({
                    id: 'pages.data.option.remove',
                    defaultMessage: '删除',
                  })
                : '请先禁用该组件，再删除。'
            }
          >
            <Popconfirm
              title={intl.formatMessage({
                id: 'pages.data.option.remove.tips',
                defaultMessage: '确认删除？',
              })}
              onConfirm={async () => {
                const resp: any = await service.remove(record.id);
                if (resp.status === 200) {
                  message.success(
                    intl.formatMessage({
                      id: 'pages.data.option.success',
                      defaultMessage: '操作成功!',
                    }),
                  );
                  actionRef.current?.reload();
                } else {
                  message.error(resp?.message || '操作失败');
                }
              }}
            >
              <Tooltip
                title={intl.formatMessage({
                  id: 'pages.data.option.remove',
                  defaultMessage: '删除',
                })}
              >
                <DeleteOutlined />
              </Tooltip>
            </Popconfirm>
          </Tooltip>
        </Button>,
      ],
    },
  ];

  registerValidateRules({
    validateId(value) {
      if (!value) return '';
      const reg = new RegExp('^[0-9a-zA-Z_\\\\-]+$');
      return reg.exec(value) ? '' : 'ID只能由数字、26个英文字母或者下划线组成';
    },
  });

  const schema: ISchema = {
    type: 'object',
    properties: {
      layout: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 1,
          minColumns: 1,
        },
        properties: {
          id: {
            title: 'ID',
            'x-component': 'Input',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 1,
            },
            'x-validator': [
              {
                required: true,
                message: '请输入ID',
              },
              {
                max: 64,
                message: '最多可输入64个字符',
              },
              {
                validateId: true,
                message: 'ID只能由数字、26个英文字母或者下划线组成',
              },
              {
                triggerType: 'onBlur',
                validator: (value: string) => {
                  if (!value) return;
                  return new Promise((resolve) => {
                    service
                      .validator(value)
                      .then((resp) => {
                        if (!!resp?.result) {
                          resolve('ID已存在');
                        } else {
                          resolve('');
                        }
                      })
                      .catch(() => '验证失败!');
                  });
                },
              },
            ],
            'x-component-props': {
              placeholder: '请输入ID',
            },
          },
          name: {
            title: '名称',
            'x-component': 'Input',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 1,
            },
            'x-component-props': {
              placeholder: '请输入名称',
            },
            'x-validator': [
              {
                required: true,
                message: '请输入名称',
              },
              {
                max: 64,
                message: '最多可输入64个字符',
              },
            ],
          },
          type: {
            title: '类型',
            'x-component': 'Select',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              tooltip: <div>jar：上传协议jar包，文件格式支持.jar或.zip</div>,
            },
            'x-component-props': {
              placeholder: '请选择类型',
            },
            'x-validator': [
              {
                required: true,
                message: '请选择类型',
              },
            ],
            enum: [
              { label: 'jar', value: 'jar' },
              { label: 'local', value: 'local' },
              // { label: 'script', value: 'script' },
            ],
          },
          configuration: {
            type: 'object',
            properties: {
              location: {
                title: '文件地址',
                'x-decorator': 'FormItem',
                'x-visible': false,
                'x-decorator-props': {
                  tooltip: (
                    <div>
                      local：填写本地协议编译目录绝对地址，如：d:/workspace/protocol/target/classes
                    </div>
                  ),
                },
                'x-validator': [
                  {
                    required: true,
                    message: '请输入文件地址',
                  },
                ],
                'x-reactions': {
                  dependencies: ['..type'],
                  fulfill: {
                    state: {
                      visible: '{{["jar","local"].includes($deps[0])}}',
                      componentType: '{{$deps[0]==="jar"?"FileUpload":"Input"}}',
                      componentProps:
                        '{{$deps[0]==="jar"?{type:"file", accept: ".jar, .zip"}:{placeholder: "请输入文件地址"}}}',
                    },
                  },
                },
              },
            },
          },
          description: {
            title: '说明',
            'x-component': 'Input.TextArea',
            'x-decorator': 'FormItem',
            'x-component-props': {
              rows: 3,
              showCount: true,
              maxLength: 200,
            },
          },
        },
      },
    },
  };

  const location = useLocation();

  useEffect(() => {
    if ((location as any).query?.save === 'true') {
      CurdModel.add();
    }
    const subscription = Store.subscribe(SystemConst.BASE_UPDATE_DATA, (data) => {
      if ((window as any).onTabSaveSuccess) {
        (window as any).onTabSaveSuccess(data);
        setTimeout(() => window.close(), 300);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <PageContainer>
      <BaseCrud
        columns={columns}
        service={service}
        title={'插件管理'}
        search={false}
        modelConfig={{ width: '550px' }}
        schema={schema}
        actionRef={actionRef}
        disableAdd={getButtonPermission('link/Protocol', ['add'])}
        formEffect={() => {
          onFormValuesChange((form) => {
            form.setFieldState('id', (state) => {
              state.disabled = CurdModel.model === 'edit';
            });
            form.setFieldState('type', (state) => {
              state.disabled = CurdModel.model === 'edit';
            });
          });
        }}
        footer={
          <>
            <Button onClick={CurdModel.close}>取消</Button>
            <Button
              type="primary"
              onClick={() => {
                Store.set('save-data', true);
              }}
            >
              保存
            </Button>
            <Button
              type="primary"
              onClick={() => {
                Store.set('save-data', async (data: any) => {
                  // 获取到的保存的数据
                  if (data.id) {
                    await modifyState(data.id, 'deploy');
                  }
                });
              }}
            >
              保存并发布
            </Button>
          </>
        }
      />
    </PageContainer>
  );
};

export default Protocol;
