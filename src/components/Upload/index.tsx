import { LoadingOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import SystemConst from '@/utils/const';
import Token from '@/utils/token';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { connect } from '@formily/react';
import { Input, Upload } from 'antd';
import type { UploadChangeParam } from 'antd/lib/upload/interface';
import type { UploadListType } from 'antd/es/upload/interface';
import './index.less';

interface Props {
  value: string;
  onChange: (value: string | FileProperty | any) => void;
  type?: 'file' | 'image';
  placeholder: string;
  display?: string;
  beforeUpload: any;
}

type FileProperty = {
  url: string;
  size: number;
};

const FUpload = connect((props: Props) => {
  const [url, setUrl] = useState<string | FileProperty>(props?.value);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (info: UploadChangeParam) => {
    if (info.file.status === 'uploading') {
      setLoading(false);
    }
    if (info.file.status === 'done') {
      info.file.url = info.file.response?.result;
      setLoading(false);
      const f = {
        size: info.file.size || 0,
        url: info.file.response?.result,
        name: info.file.name,
      };
      setUrl(f);
      props.onChange(f);
    }
  };

  const map = new Map<
    string,
    {
      node: ReactNode;
      type: UploadListType;
    }
  >();
  map.set('image', {
    node: (
      <>
        {url ? (
          <img src={url as string} alt="avatar" style={{ width: '100%' }} />
        ) : (
          <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>选择图片</div>
          </div>
        )}
      </>
    ),
    type: 'picture-card',
  });

  map.set('file', {
    node: (
      <>
        <Input
          placeholder={props.placeholder}
          // 如果display 有值的话，显示display 的值
          value={url && (url as FileProperty)[props?.display || 'url']}
          onChange={(value) => {
            setUrl({
              [props?.display || 'url']: value.target.value,
            } as any);
            props.onChange({ [props?.display || '_a']: value.target.value, url: null, size: null });
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          addonAfter={<UploadOutlined />}
        />
      </>
    ),
    type: 'text',
  });
  return (
    <Upload
      beforeUpload={props.beforeUpload}
      listType={map.get(props.type || 'image')?.type}
      action={`/${SystemConst.API_BASE}/file/static`}
      headers={{
        'X-Access-Token': Token.get(),
      }}
      onChange={handleChange}
      showUploadList={false}
    >
      {map.get(props.type || 'image')?.node}
    </Upload>
  );
});
export default FUpload;
