import { message, Modal } from 'antd';
import { useMemo } from 'react';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { Form, FormGrid, FormItem, Input, Radio, Select } from '@formily/antd';
import { ISchema } from '@formily/json-schema';
import { PermissionButton } from '@/components';
import { PlusOutlined } from '@ant-design/icons';
import Service from '@/pages/rule-engine/Alarm/Configuration/service';
import { useAsyncDataSource } from '@/utils/util';
import styles from './index.less';
import { service as ConfigService } from '../../Config';

interface Props {
  visible: boolean;
  close: () => void;
}

const alarm1 = require('/public/images/alarm/alarm1.png');
const alarm2 = require('/public/images/alarm/alarm2.png');
const alarm3 = require('/public/images/alarm/alarm3.png');
const alarm4 = require('/public/images/alarm/alarm4.png');
const alarm5 = require('/public/images/alarm/alarm5.png');

const service = new Service('alarm/config');

const createImageLabel = (image: string, text: string) => {
  return (
    <div style={{ textAlign: 'center', marginTop: 10, fontSize: '25px' }}>
      <img alt="" height="40px" src={image} />
      {text}
    </div>
  );
};

const Save = (props: Props) => {
  const { visible, close } = props;

  const LevelMap = {
    1: alarm1,
    2: alarm2,
    3: alarm3,
    4: alarm4,
    5: alarm5,
  };
  const getLevel = () => {
    return ConfigService.queryLevel().then((resp) => {
      if (resp.status === 200) {
        console.log(resp, 'resp');
        return resp.result?.levels?.map((item: { level: number; title: string }) => ({
          label: createImageLabel(LevelMap[item.level], item.title),
          value: item.level,
        }));
      }
    });
  };
  const form = useMemo(
    () =>
      createForm({
        validateFirst: true,
        effects() {},
      }),
    [],
  );

  const getSupports = () => service.getTargetTypes();

  const SchemaField = createSchemaField({
    components: {
      FormItem,
      Input,
      Select,
      FormGrid,
      Radio,
    },
  });

  const handleSave = async () => {
    const data: ConfigItem = await form.submit();
    console.log(data, 'dat');
    const resp: any = await service.update(data);
    if (resp.status === 200) {
      message.success('操作成功');
    }
  };

  const schema: ISchema = {
    type: 'object',
    properties: {
      layout: {
        type: 'void',
        'x-decorator': 'FormGrid',
        'x-decorator-props': {
          maxColumns: 2,
          minColumns: 2,
          columnGap: 24,
        },
        properties: {
          name: {
            title: '名称',
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            'x-decorator-props': {
              gridSpan: 1,
            },
            'x-component-props': {
              placeholder: '请输入名称',
            },
          },
          type: {
            title: '类型',
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            'x-decorator-props': {
              gridSpan: 1,
            },
            'x-reactions': '{{useAsyncDataSource(getSupports)}}',
            'x-component-props': {
              placeholder: '请选择类型',
            },
          },
        },
      },
      level: {
        title: '级别',
        'x-decorator': 'FormItem',
        'x-component': 'Radio.Group',
        'x-component-props': {
          optionType: 'button',
          placeholder: '请选择类型',
        },
        'x-reactions': '{{useAsyncDataSource(getLevel)}}',
        'x-decorator-props': {
          gridSpan: 1,
        },
      },
      sceneId: {
        title: '关联触发场景',
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-decorator-props': {
          gridSpan: 1,
          addonAfter: (
            <PermissionButton
              type="link"
              style={{ padding: 0 }}
              isPermission={true}
              onClick={() => {
                // const tab: any = window.open(`${origin}/#/system/department?save=true`);
                // tab!.onTabSaveSuccess = (value: any) => {
                //   form.setFieldState('orgIdList', async (state) => {
                // state.dataSource = await getOrg().then((resp) =>
                //   resp.result?.map((item: Record<string, unknown>) => ({
                //     ...item,
                //     label: item.name,
                //     value: item.id,
                //   })),
                // );
                // state.value = [...(state.value || []), value.id];
                // });
                // };
              }}
            >
              <PlusOutlined />
            </PermissionButton>
          ),
        },
        'x-component-props': {
          placeholder: '请输入名称',
        },
      },
      description: {
        title: '说明',
        'x-decorator': 'FormItem',
        'x-component': 'Input.TextArea',
        'x-decorator-props': {
          gridSpan: 1,
        },
        'x-component-props': {
          placeholder: '请输入描述信息',
        },
      },
    },
  };

  return (
    <Modal
      width="40vw"
      visible={visible}
      onOk={handleSave}
      onCancel={() => close()}
      title="新增告警"
    >
      <Form className={styles.form} form={form} layout="vertical">
        <SchemaField schema={schema} scope={{ useAsyncDataSource, getSupports, getLevel }} />
      </Form>
    </Modal>
  );
};
export default Save;
