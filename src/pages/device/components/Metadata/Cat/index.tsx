import { Button, Drawer, message, Space, Spin, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { productModel, service } from '@/pages/device/Product';
import { observer } from '@formily/react';
import { InstanceModel, service as deviceService } from '@/pages/device/Instance';
import { useLocation } from 'umi';
import InstanceService from '@/pages/device/Instance/service';
import { downloadObject } from '@/utils/util';
import { JMonacoEditor } from '@/components/FMonacoEditor';

interface Props {
  visible: boolean;
  close: () => void;
  type: 'product' | 'device';
}

const instanceService = new InstanceService('device-instance');
const Cat = observer((props: Props) => {
  const location = useLocation<{ id: string }>();
  const [codecs, setCodecs] = useState<{ id: string; name: string }[]>();
  const metadataMap = {
    product: productModel.current?.metadata as string,
    device: InstanceModel.current?.metadata as string, // 有问题
  };
  const metadata = metadataMap[props.type];
  const [value, setValue] = useState(metadata);
  const [loading, setLoading] = useState<boolean>(false);
  const _path = location.pathname.split('/');
  const id = _path[_path.length - 1];

  useEffect(() => {
    if (props.visible) {
      setLoading(true);
      if (props.type === 'device') {
        deviceService.detail(id).then((resp) => {
          setLoading(false);
          InstanceModel.current = resp.result;
          setValue(resp.result.metadata);
        });
      } else {
        service.detail(id).then((resp) => {
          setLoading(false);
          productModel.current = resp.result;
          setValue(resp.result.metadata);
        });
      }
    }
  }, [props.visible, props.type]);

  useEffect(() => {
    service.codecs().subscribe({
      next: (data) => {
        setCodecs([{ id: 'jetlinks', name: 'jetlinks' }].concat(data));
      },
    });
    if (props.type === 'device' && id) {
      instanceService.detail(id).then((resp) => {
        if (resp.status === 200) {
          InstanceModel.current = resp.result;
          const _metadata = resp.result?.metadata;
          setValue(_metadata);
        }
      });
    }
  }, [id]);

  const convertMetadata = (key: string) => {
    if (key === 'alink') {
      setValue('');
      if (metadata) {
        service.convertMetadata('to', 'alink', JSON.parse(metadata)).subscribe({
          next: (data) => {
            setValue(JSON.stringify(data));
          },
        });
      }
    } else {
      setValue(metadata);
    }
  };
  return (
    <Drawer
      maskClosable={false}
      title="查看物模型"
      width={700}
      onClose={() => props.close()}
      visible={props.visible}
      destroyOnClose
      extra={
        <Space>
          <Button
            type="primary"
            onClick={async () => {
              try {
                downloadObject(
                  JSON.parse(value),
                  `${
                    props.type === 'device'
                      ? InstanceModel.current?.name
                      : productModel.current?.name
                  }-物模型`,
                  'YYYY/MM/DD',
                );
              } catch (e) {
                message.error('请先配置物模型');
              }
            }}
          >
            导出模型文件
          </Button>
        </Space>
      }
    >
      <Spin spinning={loading}>
        <div style={{ background: '#F6F6F6' }}>
          <p style={{ padding: 10, color: 'rgba(0, 0, 0, 0.55)' }}>
            物模型是对设备在云端的功能描述，包括设备的属性、服务和事件。物联网平台通过定义一种物的描述语言来描述物模型，称之为
            TSL（即 Thing Specification Language），采用 JSON 格式，您可以根据 TSL
            组装上报设备的数据。您可以导出完整物模型，用于云端应用开发。
          </p>
        </div>
        <Tabs onChange={convertMetadata}>
          {codecs?.map((item) => (
            <Tabs.TabPane tab={item.name} tabKey={item.id} key={item.id}>
              <div style={{ border: '1px solid #eee', height: 670, width: 650 }}>
                <JMonacoEditor
                  height={'100%'}
                  theme="vs"
                  language="json"
                  key={item.id}
                  value={value}
                  editorDidMount={(editor: any) => {
                    editor.getAction('editor.action.formatDocument').run();
                    editor.onDidScrollChange?.(() => {
                      editor.getAction('editor.action.formatDocument').run();
                    });
                  }}
                />
              </div>
            </Tabs.TabPane>
          ))}
        </Tabs>
      </Spin>
    </Drawer>
  );
});

export default Cat;
