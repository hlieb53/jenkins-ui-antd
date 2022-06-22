import './index.less';
import { message } from 'antd';
import useHistory from '@/hooks/route/useHistory';
import Title from './Title';

const Image = {
  1: require('/public/images/home/1.png'),
  2: require('/public/images/home/2.png'),
  3: require('/public/images/home/3.png'),
};

interface GuideProps {
  title: string;
  data: GuideItemProps[];
}

interface GuideItemProps {
  key: string;
  name: string;
  english: string;
  url: string;
  param?: Record<string, any>;
  index?: number;
  auth: boolean;
}

const GuideItem = (props: GuideItemProps) => {
  const history = useHistory();

  const jumpPage = () => {
    if (props.url && props.auth) {
      history.push(`${props.url}`, props.param);
    } else {
      message.warning('暂无权限，请联系管理员');
    }
  };

  return (
    <div className={'home-guide-item step-bar arrow-2 pointer'} onClick={jumpPage}>
      <div className={'item-english'}>{props.english}</div>
      <div className={'item-title'}>{props.name}</div>
      <div className={`item-index`}>
        <img src={Image[props.index!]} />
      </div>
    </div>
  );
};

const Guide = (props: GuideProps) => {
  return (
    <div className={'home-guide'}>
      <Title title={props.title} />
      <div
        className={'home-guide-items'}
        style={{ gridTemplateColumns: `repeat(${props.data ? props.data.length : 1}, 1fr)` }}
      >
        {props.data.map((item, index) => (
          <GuideItem {...item} index={index + 1} key={item.key} />
        ))}
      </div>
    </div>
  );
};

Guide.Item = GuideItem;

export default Guide;
