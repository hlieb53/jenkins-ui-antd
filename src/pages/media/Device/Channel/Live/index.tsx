// 通道直播
import { useCallback, useEffect, useState } from 'react';
import { Modal, Radio } from 'antd';
import LivePlayer from '@/components/Player';
import MediaTool from '@/components/Player/mediaTool';
import { service } from '../index';
import './index.less';

interface LiveProps {
  visible: boolean;
  deviceId: string;
  channelId: string;
  onCancel: () => void;
}

const LiveFC = (props: LiveProps) => {
  const [mediaType, setMediaType] = useState('mp4');
  const [url, setUrl] = useState('');
  const [isRecord, setIsRecord] = useState(0); // 0：停止录像； 1：请求录像中； 2：开始录像

  const mediaStart = useCallback(
    async (type) => {
      const _url = service.ptzStart(props.deviceId, props.channelId, type);
      setUrl(_url);
    },
    [props.channelId, props.deviceId],
  );

  useEffect(() => {
    if (props.channelId && props.deviceId) {
      //   查询当前视频是否在录像
      service.ptzIsRecord(props.deviceId, props.channelId).then((res) => {
        if (res.code === 200) {
          setIsRecord(res.result ? 2 : 0);
        }
      });
    }
  }, [props.channelId, props.deviceId]);

  useEffect(() => {
    if (props.visible) {
      mediaStart('mp4');
    }
  }, [props.visible]);

  return (
    <Modal
      destroyOnClose
      maskClosable={false}
      visible={props.visible}
      title={'播放'}
      width={800}
      onCancel={() => {
        if (props.onCancel) {
          props.onCancel();
        }
      }}
      onOk={() => {
        if (props.onCancel) {
          props.onCancel();
        }
      }}
    >
      <div className={'media-live'}>
        <div className={'media-live-video'}>
          <div className={'media-tool'}>
            <div
              className={'tool-item'}
              onClick={async () => {
                if (isRecord === 0) {
                  setIsRecord(1);
                  const resp = await service.recordStart(props.deviceId, props.channelId, {
                    local: false,
                  });
                  if (resp.status === 200) {
                    setIsRecord(2);
                  } else {
                    setIsRecord(0);
                  }
                } else if (isRecord === 2) {
                  const resp = await service.recordStop(props.deviceId, props.channelId, {
                    local: false,
                  });
                  if (resp.status === 200) {
                    setIsRecord(0);
                  }
                }
              }}
            >
              {isRecord === 0 ? '开始录像' : isRecord === 1 ? '请求录像中' : '停止录像'}
            </div>
            <div className={'tool-item'}>刷新</div>
            <div
              className={'tool-item'}
              onClick={() => {
                service.mediaStop(props.deviceId, props.channelId);
              }}
            >
              重置
            </div>
          </div>
          <LivePlayer url={url} />
        </div>
        <MediaTool
          onMouseUp={() => {
            service.ptzStop(props.deviceId, props.channelId);
          }}
          onMouseDown={(type) => {
            service.ptzTool(props.deviceId, props.channelId, type);
          }}
        />
      </div>
      <div className={'media-live-tool'}>
        <Radio.Group
          optionType={'button'}
          buttonStyle={'solid'}
          value={mediaType}
          onChange={(e) => {
            const _type = e.target.value;
            setMediaType(_type);
            mediaStart(_type === 'hls' ? 'm3u8' : _type);
          }}
          options={[
            { label: 'MP4', value: 'mp4' },
            { label: 'FLV', value: 'flv' },
            { label: 'HLS', value: 'hls' },
          ]}
        />
      </div>
    </Modal>
  );
};

export default LiveFC;
