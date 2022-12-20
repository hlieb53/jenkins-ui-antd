import { FormItem, ArrayTable, Editable, Select, NumberPicker } from '@formily/antd';
import { createForm, Field, onFieldReact, FormPath } from '@formily/core';
import { FormProvider, createSchemaField } from '@formily/react';
import { Badge, Card, Input, Tooltip } from 'antd';
import { action } from '@formily/reactive';
import type { Response } from '@/utils/typings';
import './index.less';
import { useDomFullHeight } from '@/hooks';
import PermissionButton from '@/components/PermissionButton';
import { service } from '@/pages/link/Channel/Opcua';
import { useEffect, useState } from 'react';
import { DisconnectOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { onlyMessage } from '@/utils/util';
import { Empty } from '@/components';

interface Props {
  data: any;
}

export default (props: Props) => {
  const { data } = props;
  const { minHeight } = useDomFullHeight('.modbus');
  const { permission } = PermissionButton.usePermission('link/Channel/Opcua');
  const [properties, setProperties] = useState<any>([]);
  const [filterList, setFilterList] = useState<any>([]);
  const [masterList, setMasterList] = useState<any>([]);
  const [reload, setReload] = useState<string>('');
  const [empty, setEmpty] = useState<boolean>(false);

  //数据类型长度

  const Render = (propsText: any) => {
    const text = properties.find((item: any) => item.metadataId === propsText.value);
    return <>{text?.metadataName}</>;
  };
  const StatusRender = (propsRender: any) => {
    if (propsRender.value) {
      return <Badge status="success" text={'已绑定'} />;
    } else {
      return <Badge status="error" text={'未绑定'} />;
    }
  };
  const remove = async (params: any) => {
    const res = await service.removeDevicePoint(data.id, params);
    if (res.status === 200) {
      onlyMessage('解绑成功');
      setReload('remove');
    }
  };
  const ActionButton = () => {
    const record = ArrayTable.useRecord?.();
    const index = ArrayTable.useIndex?.();
    return (
      <PermissionButton
        isPermission={true}
        style={{ padding: 0 }}
        disabled={!record(index)?.id}
        tooltip={{
          title: '解绑',
        }}
        popConfirm={{
          title: '确认解绑',
          disabled: !record(index)?.id,
          onConfirm: async () => {
            // deteleMaster(item.id)
            remove([record(index)?.id]);
          },
        }}
        key="unbind"
        type="link"
      >
        <DisconnectOutlined />
      </PermissionButton>
    );
  };

  //异步数据源
  const getMaster = () =>
    service.noPagingOpcua({
      paging: false,
      sorts: [
        {
          name: 'createTime',
          order: 'desc',
        },
      ],
    });

  const getName = async (field: any) => {
    const path = FormPath.transform(
      field.path,
      /\d+/,
      (index) => `array.${parseInt(index)}.collectorId`,
    );
    const collectorId = field.query(path).get('value');
    if (!collectorId) return [];
    return service.getPoint({
      paging: false,
      sorts: [
        {
          name: 'createTime',
          order: 'desc',
        },
      ],
      terms: [
        {
          column: 'opcUaId',
          value: collectorId,
        },
      ],
    });
  };

  const useAsyncDataSource = (api: any) => (field: Field) => {
    field.loading = true;
    api(field).then(
      action.bound!((resp: Response<any>) => {
        field.dataSource = resp.result?.map((item: any) => ({
          label: `${item.name}(${item.opcPointId}/${item.dataMode?.text})`,
          value: item.id,
        }));
        field.loading = false;
      }),
    );
  };

  const save = async (value: any) => {
    const res = await service.saveDevicePoint(data.id, value);
    if (res.status === 200) {
      onlyMessage('保存成功');
      setReload('save');
    }
  };

  useEffect(() => {
    service
      .noPagingOpcua({
        paging: false,
        sorts: [
          {
            name: 'createTime',
            order: 'desc',
          },
        ],
      })
      .then((res) => {
        if (res.status === 200) {
          const list = res.result.map((item: any) => ({
            label: item.name,
            value: item.id,
          }));
          setMasterList(list);
        }
      });
  }, []);
  useEffect(() => {
    const metadata = JSON.parse(data.metadata).properties?.map((item: any) => ({
      metadataId: item.id,
      metadataName: `${item.name}(${item.id})`,
      metadataType: 'property',
    }));
    if (metadata && metadata.length !== 0) {
      service.getDevicePoint(data.id).then((res) => {
        if (res.status === 200) {
          // console.log(res.result)
          const array = res.result.reduce((x: any, y: any) => {
            const metadataId = metadata.find((item: any) => item.metadataId === y.metadataId);
            if (metadataId) {
              Object.assign(metadataId, y);
            } else {
              x.push(y);
            }
            return x;
          }, metadata);
          //删除物模型
          const items = array.filter((item: any) => item.metadataName);
          setProperties(items);
          setFilterList(items);
          const delList = array.filter((a: any) => !a.metadataName).map((b: any) => b.id);
          //删除后解绑
          if (delList && delList.length !== 0) {
            service.removeDevicePoint(data.id, delList);
          }
        }
      });
    } else {
      setEmpty(true);
    }
  }, [reload]);

  const SchemaField = createSchemaField({
    components: {
      FormItem,
      Editable,
      ArrayTable,
      Select,
      NumberPicker,
      Render,
      ActionButton,
      StatusRender,
    },
  });

  const form = createForm({
    values: {
      array: filterList,
    },
    effects: () => {
      onFieldReact('array.*.collectorId', async (field, f) => {
        const value = (field as Field).value;
        const path = FormPath.transform(
          field.path,
          /\d+/,
          (index) => `array.${parseInt(index)}.pointId`,
        );
        f.setFieldState(path, (state) => {
          if (value) {
            state.required = true;
            form.validate();
          } else {
            state.required = false;
            form.validate();
          }
        });
      });
    },
  });

  const schema = {
    type: 'object',
    properties: {
      array: {
        type: 'array',
        'x-decorator': 'FormItem',
        'x-component': 'ArrayTable',
        'x-component-props': {
          pagination: {
            pageSize: 10,
          },
          scroll: { x: '100%' },
        },
        items: {
          type: 'object',
          properties: {
            column1: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': { width: 120, title: '属性' },
              properties: {
                metadataId: {
                  type: 'string',
                  'x-component': 'Render',
                },
              },
            },
            column2: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': { width: 200, title: '通道' },
              properties: {
                collectorId: {
                  type: 'string',
                  'x-decorator': 'FormItem',
                  'x-component': 'Select',
                  'x-component-props': {
                    placeholder: '请选择',
                    showSearch: true,
                    allowClear: true,
                    showArrow: true,
                    filterOption: (input: string, option: any) =>
                      option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0,
                  },
                  enum: masterList,
                },
              },
            },
            column3: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': {
                width: 200,
                title: (
                  <>
                    点位名称
                    <Tooltip title="名称(点位ID/数据模式)">
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </>
                ),
              },
              properties: {
                pointId: {
                  type: 'string',
                  'x-decorator': 'FormItem',
                  'x-component': 'Select',
                  'x-component-props': {
                    placeholder: '请选择',
                    showSearch: true,
                    allowClear: true,
                    showArrow: true,
                    filterOption: (input: string, option: any) =>
                      option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0,
                  },
                  'x-reactions': ['{{useAsyncDataSource(getName)}}'],
                },
              },
            },
            column6: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': {
                width: 100,
                title: '状态',
                sorter: (a: any, b: any) => a.state.value.length - b.state.value.length,
              },
              properties: {
                id: {
                  type: 'string',
                  'x-decorator': 'FormItem',
                  'x-component': 'StatusRender',
                },
              },
            },
            column7: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': {
                title: '操作',
                dataIndex: 'operations',
                width: 50,
                fixed: 'right',
              },
              properties: {
                item: {
                  type: 'void',
                  'x-component': 'FormItem',
                  properties: {
                    remove: {
                      type: 'void',
                      'x-component': 'ActionButton',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  return (
    <Card className="modbus" style={{ minHeight }}>
      {empty ? (
        <Empty description={'暂无数据，请配置物模型'} style={{ marginTop: '10%' }} />
      ) : (
        <>
          <div className="edit-top">
            <Input.Search
              placeholder="请输入属性ID"
              allowClear
              style={{ width: 190 }}
              onSearch={(value) => {
                if (value) {
                  const items = properties.filter((item: any) => item.metadataId.match(value));
                  setFilterList(items);
                } else {
                  setFilterList(properties);
                }
              }}
            />
            <PermissionButton
              onClick={async () => {
                const value: any = await form.submit();
                const items = value.array.filter((item: any) => item.collectorId);
                save(items);
              }}
              isPermission={permission.add}
              key="add"
              type="primary"
              style={{ marginRight: 10 }}
            >
              保存
            </PermissionButton>
          </div>
          <div className="edit-table">
            <FormProvider form={form}>
              <SchemaField schema={schema} scope={{ useAsyncDataSource, getName, getMaster }} />
            </FormProvider>
          </div>
        </>
      )}
    </Card>
  );
};
