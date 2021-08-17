import { useMemo, useRef } from 'react';
import useWebSocket from './useWebSocket';
import { Observable } from 'rxjs';
import Token from '@/utils/token';
import type { WebsocketPayload } from '@/hooks/websocket/typings';
import { notification } from 'antd';

const url = `${document.location.protocol.replace('http', 'ws')}//${
  document.location.host
}/jetlinks/messaging/${Token.get()}?:X_Access_Token=${Token.get()}`;

enum MsgType {
  sub = 'sub',
  unsub = 'unsub',
}

const subscribeList: Record<string, { next: any; complete: any }[]> = {};

export const useSendWebsocketMessage = () => {
  const messageHistory = useRef<any>([]);

  /**
   * 分发消息
   * @param message
   */
  const dispenseMessage = (message: MessageEvent) => {
    const data = JSON.parse(message.data) as WebsocketPayload;
    if (data.type === 'error') {
      notification.error({ key: 'websocket-error', message: data.message });
    }
    if (subscribeList[data.requestId]) {
      if (data.type === 'complete') {
        subscribeList[data.requestId].forEach((element: any) => {
          element.complete();
        });
      } else if (data.type === 'result') {
        subscribeList[data.requestId].forEach((element: any) => {
          element.next(data);
        });
      }
    }
  };
  const { sendMessage, latestMessage } = useWebSocket(url, {
    reconnectInterval: 1000,
    reconnectLimit: 1,
    onClose: () => notification.error({ key: 'websocket-error', message: '网络错误，请刷新重试' }),
    onOpen: (event) => console.log('打开链接', event),
    onError: (event) => console.log('报错了', event),
    onMessage: dispenseMessage,
  });

  messageHistory.current = useMemo(
    () => messageHistory.current.concat(latestMessage),
    [latestMessage],
  );

  const subscribeTopic = (
    id: string,
    topic: string,
    parameter: Record<string, any>,
  ): Observable<any> => {
    return new Observable((subscriber) => {
      if (!subscribeList[id]) {
        subscribeList[id] = [];
      }
      subscribeList[id].push({
        next: (value: any) => subscriber.next(value),
        complete: () => subscriber.complete(),
      });
      const message = JSON.stringify({ id, topic, parameter, type: MsgType.sub });
      sendMessage?.(message);
      return () => {
        const unsub = JSON.stringify({ id, type: MsgType.unsub });
        delete subscribeList[id];
        sendMessage?.(unsub);
      };
    });
  };

  return [subscribeTopic, sendMessage];
};

export default useSendWebsocketMessage;
