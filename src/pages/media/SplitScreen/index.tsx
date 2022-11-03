// 视频分屏
import { PageContainer } from '@ant-design/pro-layout';
import { Card } from 'antd';
import LeftTree from './tree';
import { ScreenPlayer } from '@/components';
import { ptzStart, ptzStop, ptzTool } from './service';
import { useEffect, useRef, useState } from 'react';
import './index.less';
import { useDomFullHeight } from '@/hooks';

const SplitScreen = () => {
  const [deviceId, setDeviceId] = useState('');
  const [channelId, setChannelId] = useState('');
  const player = useRef<any>(null);
  const { minHeight } = useDomFullHeight(`.splitScreen`);

  const getMediaUrl = (dId: string, cId: string): string => {
    return ptzStart(dId, cId, 'mp4');
  };

  const mediaStart = async (dId: string, cId: string) => {
    setChannelId(cId);
    setDeviceId(dId);
    player.current?.replaceVideo(dId, cId, getMediaUrl(dId, cId));
  };

  useEffect(() => {
    document.body.style.overflowY = 'scroll';
    return () => {
      document.body.style.overflowY = '';
    };
  }, []);

  return (
    <PageContainer>
      <Card style={{ minHeight }} className="splitScreen">
        <div className="split-screen">
          <LeftTree onSelect={mediaStart} />
          <div className="right-content">
            <ScreenPlayer
              ref={player}
              id={deviceId}
              channelId={channelId}
              onMouseUp={(id, cId) => {
                ptzStop(id, cId);
              }}
              onMouseDown={(id, cId, type) => {
                ptzTool(id, cId, type);
              }}
              historyHandle={(dId, cId) => getMediaUrl(dId, cId)}
            />
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};
export default SplitScreen;
