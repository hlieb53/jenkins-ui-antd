import { PageContainer } from '@ant-design/pro-layout';
import { createSchemaField, observer } from '@formily/react';
import {
  ArrayCollapse,
  Form,
  FormButtonGroup,
  FormCollapse,
  FormGrid,
  FormItem,
  Input,
  NumberPicker,
  Password,
  Radio,
  Select,
} from '@formily/antd';
import type { ISchema } from '@formily/json-schema';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Field, FieldDataSource, registerValidateRules } from '@formily/core';
import { onFormInit } from '@formily/core';
import { createForm, onFieldReact, onFieldValueChange } from '@formily/core';
import { Card, Col, Row } from 'antd';
import styles from './index.less';
import { isNoCommunity, onlyMessage, useAsyncDataSource } from '@/utils/util';
import { service } from '../index';
import _ from 'lodash';
import FAutoComplete from '@/components/FAutoComplete';
import { Store } from 'jetlinks-store';
import { PermissionButton } from '@/components';
import usePermissions from '@/hooks/permission';
import { action } from '@formily/reactive';
import FMonacoEditor from '@/components/FMonacoEditor';
import { useParams } from 'umi';
import { useLocation } from '@/hooks';

/**
 *  根据类型过滤配置信息
 * @param data
 * @param type
 */
const filterConfigByType = (data: any[], type: string) => {
  const tcpList = ['TCP_SERVER', 'WEB_SOCKET_SERVER', 'HTTP_SERVER', 'MQTT_SERVER'];
  const udpList = ['UDP', 'COAP_SERVER'];

  let _temp = type;
  if (tcpList.includes(type)) {
    _temp = 'TCP';
  } else if (udpList.includes(type)) {
    _temp = 'UDP';
  }
  // 只保留ports 包含type的数据
  const _config = data?.filter((item) => Object.keys(item.ports).includes(_temp));
  // 只保留ports的type数据
  return _config?.map((i) => {
    i.ports = i.ports[_temp];
    return i;
  });
};
const Save = observer(() => {
  const param = useParams<{ id: string }>();
  const locations = useLocation();
  const [view, setView] = useState<boolean>(false);

  const configRef = useRef([]);

  const useAsyncData = (services: (arg0: Field) => Promise<FieldDataSource>) => (field: Field) => {
    field.loading = true;
    services(field).then(
      action.bound!((resp: any) => {
        const type = location.href.split('?')?.pop()?.split('=')?.pop() || '';
        const save = location?.href?.split?.('/');
        if (location.href.includes('type=') && !!type) {
          field.value = type;
        } else if (save[save.length - 1] === ':id') {
          field.value = resp[0].value;
        }
        field.dataSource = resp;
        field.loading = false;
      }),
    );
  };

  const getResourcesClusters = () => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const checked = form.getValuesIn('cluster')?.map((i: any) => i?.serverId) || [];
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const share = form.getValuesIn('shareCluster');
    if (share) {
      return new Promise((resolve) => {
        resolve([]);
      });
    } else {
      if (Store.get('resources-cluster')?.length > 0) {
        return new Promise((resolve) => {
          resolve(Store.get('resources-cluster').filter((j: any) => !checked.includes(j.value)));
        });
      } else {
        return service.getResourceClusters().then((resp) => {
          const _data = resp.result?.map((item: any) => ({
            label: item.name,
            value: item.id,
          }));
          Store.set('resources-cluster', _data);
          return (_data || []).filter((j: any) => !checked.includes(j.value));
        });
      }
    }
  };
  const getCertificates = () =>
    service.getCertificates().then((resp: any) =>
      resp.result?.map((item: any) => ({
        label: item.name,
        value: item.id,
      })),
    );

  const getResourceById = (id: string, type: string) =>
    service.getResourceClustersById(id).then((resp) => filterConfigByType(resp.result, type));

  const form = useMemo(
    () =>
      createForm({
        // readPretty: true,
        // initialValues: {},
        effects() {
          onFormInit(async (form1) => {
            const response = await service.getResourcesCurrent();
            if (response.status === 200) {
              configRef.current = response.result;
            }
            if (param?.id && param.id !== ':id') {
              const resp = await service.detail(param.id);
              const data = resp?.result || {};
              if (data?.shareCluster === false) {
                data.cluster = (data?.cluster || []).map((item: any) => {
                  return {
                    ...item.configuration,
                  };
                });
              }
              form1.setValues({ ...data });
            }
          });
          onFieldValueChange('type', (field, f) => {
            const value = (field as Field).value;
            if (f.modified) {
              f.deleteValuesIn('configuration');
              f.deleteValuesIn('cluster');
              f.clearErrors();
              // 设置默认值
              f.setFieldState('grid.configuration.panel1.layout2.host', (state) => {
                state.value = '0.0.0.0';
                state.disabled = true;
              });
              f.setFieldState('grid.configuration.panel1.layout2.secure', (state) => {
                state.value = false;
              });
              f.setFieldState('shareCluster', (state) => {
                state.value = true;
              });
            }
            const _host = filterConfigByType(_.cloneDeep(configRef.current), value);
            f.setFieldState('grid.configuration.panel1.layout2.host', (state) => {
              state.dataSource = _host.map((item) => ({ label: item.host, value: item.host }));
            });
            f.setFieldState('grid.cluster.cluster.*.layout2.host', (state) => {
              state.dataSource = _host.map((item) => ({ label: item.host, value: item.host }));
            });
          });
          onFieldReact('grid.configuration.panel1.layout2.host', async (field, f1) => {
            const value = (field as Field).value;
            const type = (field.query('type').take() as Field).value;
            const resp = await service.getResourcesCurrent();
            const current = resp?.result;
            const _port = filterConfigByType(_.cloneDeep(current), type);
            const _host = _port.find((item) => item.host === value);
            f1.setFieldState('grid.configuration.panel1.layout2.port', (state) => {
              state.dataSource = _host?.ports.map((p: any) => ({ label: p, value: p }));
            });
          });
          onFieldValueChange('shareCluster', (field, f5) => {
            const value = (field as Field).value;
            if (value) {
              // 共享配置
              f5.setFieldState('grid.configuration.panel1.layout2.host', (state) => {
                state.value = '0.0.0.0';
                state.disabled = true;
              });
            }
            if (f5.modified && !value) {
              // 独立配置
              f5.setFieldState('grid.cluster.cluster', (state) => {
                state.value = [{}];
              });
              f5.setFieldState('grid.cluster.cluster.*.layout2.host', (state) => {
                state.value = undefined;
                state.disabled = false;
              });
            }
          });
          onFieldReact('grid.cluster.cluster.*.layout2.serverId', async (field, f3) => {
            const value = (field as Field).value;
            const type = (field.query('type').take() as Field).value;
            if (value) {
              const response = await getResourceById(value, type);
              f3.setFieldState(field.query('.host'), (state) => {
                state.dataSource = response.map((item) => ({ label: item.host, value: item.host }));
              });
            }
          });
          onFieldReact('grid.cluster.cluster.*.layout2.host', async (field, f4) => {
            const host = (field as Field).value;
            const value = (field.query('.serverId').take() as Field)?.value;
            const type = (field.query('type').take() as Field)?.value;
            if (value) {
              const response = await getResourceById(value, type);
              const _ports = response.find((item) => item.host === host);
              f4.setFieldState(field.query('.port').take(), async (state) => {
                state.dataSource = _ports?.ports?.map((i: any) => ({ label: i, value: i }));
              });
            }
          });
        },
      }),
    [param.id],
  );

  const SchemaField = createSchemaField({
    components: {
      FormItem,
      Input,
      Select,
      Radio,
      NumberPicker,
      Password,
      FormGrid,
      FormCollapse,
      ArrayCollapse,
      FAutoComplete,
      FMonacoEditor,
    },
  });

  const formCollapse = FormCollapse.createFormCollapse!();

  const getSupports = () =>
    service.getSupports().then((resp) =>
      resp.result?.map((item: any) => ({
        label: item.name,
        value: item.id,
      })),
    );

  registerValidateRules({
    IpOrDomain(value) {
      if (!value) return '';
      const regIp = /((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/;
      const regDomain = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/;
      return regIp.test(value) || regDomain.test(value) ? '' : '请输入IP或者域名';
    },
  });

  const clusterConfig: ISchema = {
    type: 'void',
    'x-component': 'FormGrid',
    'x-component-props': {
      maxColumns: 2,
      minColumns: 1,
      columnGap: 48,
    },
    properties: {
      serverId: {
        title: '节点名称',
        'x-component': 'Select',
        'x-decorator': 'FormItem',
        // 'x-visible': false,
        'x-decorator-props': {
          gridSpan: 1,
          labelAlign: 'left',
          layout: 'vertical',
        },
        'x-component-props': {
          placeholder: '请选择节点名称',
        },
        'x-reactions': [
          {
            dependencies: ['shareCluster'],
            fulfill: {
              state: {
                visible: '{{!$deps[0]}}',
              },
            },
          },
          '{{useAsyncDataSource(getResourcesClusters)}}',
        ],
      },
      host: {
        title: '本地地址',
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-component-props': {
          placeholder: '请选择本地地址',
        },
        'x-decorator-props': {
          gridSpan: 1,
          labelAlign: 'left',
          layout: 'vertical',
          tooltip: '绑定到服务器上的网卡地址,绑定到所有网卡:0.0.0.0',
        },
        required: true,
        'x-reactions': {
          dependencies: ['type'],
          fulfill: {
            state: {
              // visible: '{{$deps[0]==="UDP"}}',
              visible:
                '{{["COAP_SERVER","MQTT_SERVER","WEB_SOCKET_SERVER","TCP_SERVER","UDP","HTTP_SERVER"].includes($deps[0])}}',
            },
          },
        },
        'x-validator': ['ipv4'],
      },
      port: {
        title: '本地端口',
        'x-decorator-props': {
          gridSpan: 1,
          labelAlign: 'left',
          tooltip: '监听指定端口的请求',
          layout: 'vertical',
        },
        required: true,
        type: 'number',
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-component-props': {
          placeholder: '请选择本地端口',
        },
        'x-reactions': {
          dependencies: ['type'],
          fulfill: {
            state: {
              // visible: '{{$deps[0]==="UDP"}}',
              visible:
                '{{["COAP_SERVER","MQTT_SERVER","WEB_SOCKET_SERVER","TCP_SERVER","UDP","HTTP_SERVER"].includes($deps[0])}}',
            },
          },
        },
        'x-validator': [
          {
            max: 65535,
            message: '请输入1-65535之间的正整数',
          },
          {
            min: 1,
            message: '请输入1-65535之间的正整数',
          },
        ],
      },
      publicHost: {
        title: '公网地址',
        'x-decorator-props': {
          gridSpan: 1,
          labelAlign: 'left',
          tooltip: (
            <span>
              对外提供访问的地址,
              <br />
              内网环境时填写服务器的内网IP地址
            </span>
          ),
          layout: 'vertical',
        },
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input',
        'x-validator': [
          {
            IpOrDomain: true,
          },
        ],
        'x-component-props': {
          placeholder: '请输入公网地址',
        },
        'x-reactions': {
          dependencies: ['type'],
          fulfill: {
            state: {
              // visible: '{{$deps[0]==="UDP"}}',
              visible:
                '{{["COAP_SERVER","MQTT_SERVER","WEB_SOCKET_SERVER","TCP_SERVER","UDP","HTTP_SERVER"].includes($deps[0])}}',
            },
          },
        },
      },
      publicPort: {
        title: '公网端口',
        'x-decorator-props': {
          gridSpan: 1,
          tooltip: '对外提供访问的端口',
          layout: 'vertical',
          labelAlign: 'left',
        },
        'x-component-props': {
          placeholder: '请输入公网端口',
        },
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'NumberPicker',
        'x-reactions': {
          dependencies: ['type'],
          fulfill: {
            state: {
              // visible: '{{$deps[0]==="UDP"}}',
              visible:
                '{{["COAP_SERVER","MQTT_SERVER","WEB_SOCKET_SERVER","TCP_SERVER","UDP","HTTP_SERVER"].includes($deps[0])}}',
            },
          },
        },
        'x-validator': [
          {
            max: 65535,
            message: '请输入1-65535之间的正整数',
          },
          {
            min: 1,
            message: '请输入1-65535之间的正整数',
          },
        ],
      },
      mqttClient: {
        type: 'void',
        'x-reactions': {
          dependencies: ['type'],
          fulfill: {
            state: {
              // visible: '{{$deps[0]==="UDP"}}',
              visible: '{{["MQTT_CLIENT"].includes($deps[0])}}',
            },
          },
        },
        properties: {
          remoteHost: {
            title: '远程地址',
            'x-decorator-props': {
              gridSpan: 1,
              layout: 'vertical',
              labelAlign: 'left',
            },
            'x-component-props': {
              placeholder: '请输入远程地址',
            },
            required: true,
            'x-validator': [
              {
                IpOrDomain: true,
              },
            ],
            'x-decorator': 'FormItem',
            'x-component': 'Input',
          },
          remotePort: {
            title: '远程端口',
            'x-decorator-props': {
              gridSpan: 1,
              layout: 'vertical',
              labelAlign: 'left',
            },
            'x-component-props': {
              placeholder: '请输入远程端口',
            },
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'NumberPicker',
          },
          clientId: {
            title: 'clientId',
            'x-decorator-props': {
              gridSpan: 1,
              layout: 'vertical',
              labelAlign: 'left',
            },
            'x-component-props': {
              placeholder: '请输入ClientId',
            },
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'Input',
          },
          username: {
            title: '用户名',
            'x-decorator-props': {
              gridSpan: 1,
              layout: 'vertical',
              labelAlign: 'left',
            },
            'x-component-props': {
              placeholder: '请输入用户名',
            },
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'Input',
          },
          password: {
            title: '密码',
            'x-component-props': {
              placeholder: '请输入密码',
            },
            'x-decorator-props': {
              gridSpan: 1,
              layout: 'vertical',
              labelAlign: 'left',
            },
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'Input',
          },
          // maxMessageSize: {
          //   title: '最大消息长度',
          //   'x-decorator-props': {
          //     gridSpan: 1,
          //     tooltip: '单次收发消息的最大长度,单位:字节;设置过大可能会影响性能',
          //     layout: 'vertical',
          //     labelAlign: 'left',
          //   },
          //   'x-component-props': {
          //     placeholder: '请输入最大消息长度',
          //   },
          //   required: true,
          //   'x-decorator': 'FormItem',
          //   'x-component': 'Input',
          // },
          topicPrefix: {
            title: '订阅前缀',
            'x-component-props': {
              placeholder: '请输入订阅前缀',
            },
            'x-decorator-props': {
              gridSpan: 1,
              tooltip: '当连接的服务为EMQ时,可能需要使用共享的订阅前缀,如:$queue或$share',
              layout: 'vertical',
              labelAlign: 'left',
            },
            'x-decorator': 'FormItem',
            'x-component': 'Input',
          },
        },
      },
      maxMessageSize: {
        title: '最大消息长度',
        'x-decorator': 'FormItem',
        'x-component': 'Input',
        'x-decorator-props': {
          gridSpan: 1,
          labelAlign: 'left',
          tooltip: '单次收发消息的最大长度,单位:字节;设置过大可能会影响性能',
          layout: 'vertical',
        },
        'x-component-props': {
          placeholder: '请输入最大消息长度',
        },
        'x-reactions': {
          dependencies: ['type'],
          fulfill: {
            state: {
              // visible: '{{$deps[0]==="UDP"}}',
              visible: '{{["MQTT_SERVER","MQTT_CLIENT"].includes($deps[0])}}',
              // hidden:'{{["MQTT_SERVER"].includes($deps[0])}}'
            },
          },
        },
      },
      secure: {
        // title: '开启DTLS',
        'x-decorator': 'FormItem',
        'x-component': 'Radio.Group',
        'x-decorator-props': {
          gridSpan: 2,
          labelAlign: 'left',
          layout: 'vertical',
        },
        required: true,
        default: false,
        enum: [
          { label: '是', value: true },
          { label: '否', value: false },
        ],
        'x-reactions': {
          dependencies: ['type'],
          fulfill: {
            state: {
              title:
                '{{!["TCP_SERVER", "UDP", "COAP_SERVER"].includes($deps[0]) ? "开启TLS" : "开启DTLS"}}',
            },
          },
        },
      },
      certId: {
        title: '证书',
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-component-props': {
          placeholder: '请选择证书',
        },
        'x-decorator-props': {
          gridSpan: 1,
          labelAlign: 'left',
          layout: 'vertical',
        },
        required: true,
        'x-reactions': [
          '{{useAsyncDataSource(getCertificates)}}',
          {
            dependencies: ['..secure'],
            fulfill: {
              state: {
                visible: '{{$deps[0]===true}}',
              },
            },
          },
        ],
      },
      privateKeyAlias: {
        title: '私钥别名',
        'x-decorator': 'FormItem',
        'x-component': 'Input',
        'x-component-props': {
          placeholder: '请输入私钥别名',
        },
        'x-decorator-props': {
          gridSpan: 1,
          labelAlign: 'left',
          layout: 'vertical',
        },
        required: true,
        'x-validator': [
          {
            max: 64,
            message: '最多可输入64个字符',
          },
          {
            required: true,
            message: '请输入私钥别名',
          },
        ],
        'x-reactions': {
          dependencies: ['..secure'],
          fulfill: {
            state: {
              visible: '{{$deps[0]===true}}',
            },
          },
        },
      },
      parserType: {
        // TCP
        required: true,
        title: '粘拆包规则',
        'x-decorator-props': {
          gridSpan: 2,
          tooltip: '处理TCP粘拆包的方式',
          layout: 'vertical',
          labelAlign: 'left',
        },
        'x-visible': false,
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-component-props': {
          placeholder: '请选择粘拆包规则',
          style: { width: 'calc(50% - 24px)' },
        },
        enum: [
          { value: 'DIRECT', label: '不处理' },
          { value: 'delimited', label: '分隔符' },
          { value: 'script', label: '自定义脚本' },
          { value: 'fixed_length', label: '固定长度' },
          { value: 'length', label: '长度字段' },
        ],
        'x-reactions': {
          dependencies: ['type'],
          fulfill: {
            state: {
              // visible: '{{$deps[0]==="UDP"}}',
              visible: '{{["TCP_SERVER"].includes($deps[0])}}',
            },
          },
        },
      },
      parserConfiguration: {
        type: 'object',
        'x-component': 'FormGrid',
        'x-decorator': 'FormItem',
        'x-component-props': {
          maxColumns: 2,
          minColumns: 1,
          className: styles.parser,
        },
        'x-decorator-props': {
          gridSpan: 2,
        },
        'x-reactions': [
          {
            dependencies: ['.parserType'],
            fulfill: {
              state: {
                visible: '{{["delimited", "script", "fixed_length", "length"].includes($deps[0])}}',
              },
            },
          },
        ],
        properties: {
          delimited: {
            title: '分隔符',
            'x-component': 'Input',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              labelAlign: 'left',
              layout: 'vertical',
              gridSpan: 1,
            },
            'x-validator': [
              {
                required: true,
                message: '请输入分隔符',
              },
            ],
            'x-component-props': {
              style: { width: '50%' },
              placeholder: '请输入分隔符',
            },
            'x-reactions': [
              {
                dependencies: ['..parserType'],
                fulfill: {
                  state: {
                    visible: '{{$deps[0] === "delimited"}}',
                  },
                },
              },
            ],
          },
          lang: {
            title: '脚本语言',
            'x-component': 'Select',
            'x-decorator': 'FormItem',
            'x-disabled': true,
            'x-hidden': true,
            'x-value': 'javascript',
            'x-decorator-props': {
              labelAlign: 'left',
              layout: 'vertical',
              gridSpan: 2,
            },
            'x-validator': [
              {
                required: true,
                message: '请选择',
              },
            ],
            'x-reactions': [
              {
                dependencies: ['..parserType'],
                fulfill: {
                  state: {
                    // visible: '{{$deps[0] === "script"}}',
                    value: '{{$deps[0] === "script" ? "javascript" : ""}}',
                  },
                },
              },
            ],
            enum: [{ label: 'JavaScript', value: 'javascript' }],
          },
          script: {
            title: '解析脚本',
            'x-component': 'FMonacoEditor',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              labelAlign: 'left',
              layout: 'vertical',
              gridSpan: 2,
            },
            'x-component-props': {
              language: 'javascript',
              height: 200,
              editorDidMount: (editor1: any) => {
                editor1.onDidScrollChange?.(() => {
                  editor1.getAction('editor.action.formatDocument').run();
                });
              },
            },
            'x-validator': [
              {
                required: true,
                message: '请输入脚本',
              },
            ],
            'x-reactions': [
              {
                dependencies: ['..parserType'],
                fulfill: {
                  state: {
                    visible: '{{$deps[0] === "script"}}',
                  },
                },
              },
            ],
          },
          size: {
            title: '长度值',
            'x-component': 'NumberPicker',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              labelAlign: 'left',
              layout: 'vertical',
              gridSpan: 1,
            },
            'x-validator': [
              {
                required: true,
                message: '请输入长度值',
              },
            ],
            'x-component-props': {
              style: { width: '50%' },
              placeholder: '请输入长度值',
            },
            'x-reactions': [
              {
                dependencies: ['..parserType'],
                fulfill: {
                  state: {
                    visible: '{{$deps[0] === "fixed_length"}}',
                  },
                },
              },
            ],
          },
          length: {
            title: '长度',
            'x-component': 'Select',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              labelAlign: 'left',
              layout: 'vertical',
              gridSpan: 1,
            },
            'x-validator': [
              {
                required: true,
                message: '请选择长度',
              },
            ],
            enum: [1, 2, 3, 4, 8],
            default: 4,
            'x-component-props': {
              placeholder: '请选择长度',
            },
            'x-reactions': [
              {
                dependencies: ['..parserType'],
                fulfill: {
                  state: {
                    visible: '{{$deps[0] === "length"}}',
                  },
                },
              },
            ],
          },
          offset: {
            title: '偏移量',
            'x-component': 'NumberPicker',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              labelAlign: 'left',
              layout: 'vertical',
              gridSpan: 1,
            },
            'x-validator': [
              {
                max: 65535,
                message: '请输入0-65535之间的正整数',
              },
              {
                min: 0,
                message: '请输入0-65535之间的正整数',
              },
            ],
            'x-component-props': {
              placeholder: '请输入偏移量',
            },
            default: 0,
            'x-reactions': [
              {
                dependencies: ['..parserType'],
                fulfill: {
                  state: {
                    visible: '{{$deps[0] === "length"}}',
                  },
                },
              },
            ],
          },
          little: {
            title: '大小端',
            type: 'boolean',
            'x-component': 'Select',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              labelAlign: 'left',
              layout: 'vertical',
              gridSpan: 1,
            },
            'x-component-props': {
              placeholder: '请选择大小端',
            },
            default: false,
            enum: [
              { label: '大端', value: false },
              { label: '小端', value: true },
            ],
            'x-reactions': [
              {
                dependencies: ['..parserType'],
                fulfill: {
                  state: {
                    visible: '{{$deps[0] === "length"}}',
                  },
                },
              },
            ],
          },
        },
      },
    },
  };
  const schema: ISchema = {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 2,
          minColumns: 1,
          columnGap: 48,
        },
        properties: {
          name: {
            title: '名称',
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            'x-decorator-props': {
              gridSpan: 1,
            },
            'x-component-props': {
              placeholder: '请输入名称',
            },
            'x-validator': [
              {
                max: 64,
                message: '最多可输入64个字符',
              },
              {
                required: true,
                message: '请输入名称',
              },
            ],
          },
          type: {
            title: '类型',
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            'x-decorator-props': {
              gridSpan: 1,
            },
            'x-component-props': {
              placeholder: '请选择类型',
            },
            default: {},
            'x-validator': [
              {
                required: true,
                message: '请输入名称',
              },
            ],
            'x-reactions': ['{{useAsyncData(getSupports)}}'],
          },
          shareCluster: {
            title: '集群',
            'x-decorator': 'FormItem',
            'x-component': 'Radio.Group',
            required: true,
            default: true,
            'x-hidden': !isNoCommunity,
            enum: [
              { label: '共享配置', value: true },
              { label: '独立配置', value: false },
            ],
            'x-component-props': {
              buttonStyle: 'solid',
              optionType: 'button',
            },
            'x-decorator-props': {
              gridSpan: 2,
              tooltip: isNoCommunity
                ? '共享配置:集群下所有节点共用同一配置\r\n' + '独立配置:集群下不同节点使用不同配置'
                : '',
            },
          },
          configuration: {
            type: 'object',
            // 'x-visible': false,
            'x-decorator': 'FormItem',
            'x-component': 'FormCollapse',
            'x-component-props': {
              formCollapse: '{{formCollapse}}',
              className: styles.configuration,
            },
            'x-reactions': [
              {
                dependencies: ['.shareCluster', 'type'],
                fulfill: {
                  state: {
                    visible: '{{!!$deps[1]&&$deps[0]===true}}',
                  },
                },
              },
            ],
            'x-decorator-props': {
              gridSpan: 2,
            },
            properties: {
              panel1: {
                type: 'void',
                'x-component': 'FormCollapse.CollapsePanel',
                properties: {
                  layout2: clusterConfig,
                },
              },
            },
          },
          cluster: {
            type: 'void',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-reactions': {
              dependencies: ['.shareCluster', 'type'],
              fulfill: {
                state: {
                  visible: '{{!!$deps[1]&&$deps[0]===false}}',
                },
              },
            },
            'x-visible': false,
            properties: {
              cluster: {
                type: 'array',
                'x-component': 'ArrayCollapse',
                'x-decorator': 'FormItem',
                items: {
                  type: 'object',
                  'x-component': 'ArrayCollapse.CollapsePanel',
                  'x-component-props': {
                    header: '配置信息',
                  },
                  properties: {
                    index: {
                      type: 'void',
                      'x-component': 'ArrayCollapse.Index',
                    },
                    layout2: clusterConfig,
                    remove: {
                      type: 'void',
                      'x-component': 'ArrayCollapse.Remove',
                    },
                  },
                },
                properties: {
                  addition: {
                    type: 'void',
                    title: '新增',
                    'x-component': 'ArrayCollapse.Addition',
                    'x-component-props': {
                      ghost: true,
                      type: 'primary',
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
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component-props': {
              placeholder: '请输入说明',
              showCount: true,
              maxLength: 200,
              rows: 5,
            },
          },
        },
      },
    },
  };

  const handleSave = async () => {
    const data: any = await form.submit();
    if (data.shareCluster === false) {
      data.cluster = data.cluster?.map((item: any) => ({
        serverId: item.serverId,
        configuration: item,
      }));
    }
    const response: any = data.id ? await service.update(data) : await service.save(data);
    if (response.status === 200) {
      onlyMessage('保存成功');
      history.back();
      if ((window as any).onTabSaveSuccess) {
        if (response.result?.id) {
          service.changeState(response.result?.id, 'start').then(() => {
            (window as any).onTabSaveSuccess(response);
            setTimeout(() => window.close(), 300);
          });
        }
      }
    }
  };

  const { getOtherPermission } = usePermissions('link/Type');
  useEffect(() => {
    if (locations && locations.state) {
      setView(locations.state.view);
    }
  }, [locations]);
  return (
    <PageContainer>
      <Card>
        <Row gutter={24}>
          <Col span={16}>
            <Form form={form} layout="vertical">
              <SchemaField
                schema={schema}
                scope={{
                  formCollapse,
                  useAsyncDataSource,
                  useAsyncData,
                  getSupports,
                  getResourcesClusters,
                  getCertificates,
                }}
              />
              <FormButtonGroup.Sticky>
                <FormButtonGroup.FormItem>
                  {!view && (
                    <PermissionButton
                      type="primary"
                      isPermission={getOtherPermission(['add', 'update'])}
                      onClick={() => handleSave()}
                    >
                      保存
                    </PermissionButton>
                  )}
                </FormButtonGroup.FormItem>
              </FormButtonGroup.Sticky>
            </Form>
          </Col>
        </Row>
      </Card>
    </PageContainer>
  );
});

export default Save;
