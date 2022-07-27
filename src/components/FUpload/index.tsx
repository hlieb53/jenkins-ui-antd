import { UploadOutlined } from '@ant-design/icons';
import SystemConst from '@/utils/const';
import Token from '@/utils/token';
import { useState } from 'react';
import { connect } from '@formily/react';
import { Input, Upload } from 'antd';
import type { UploadChangeParam } from 'antd/lib/upload/interface';
import './index.less';

interface Props {
  value: any;
  onChange: (value: any) => void;
  placeholder: string;
  beforeUpload: any;
}

const FUpload = connect((props: Props) => {
  const [url, setUrl] = useState<any>(props?.value?.url);

  const handleChange = (info: UploadChangeParam) => {
    if (info.file.status === 'done') {
      const result = info.file.response?.result;
      const f = {
        ...result,
        url: `${location.protocol}//${SystemConst.API_BASE}/file/${result?.id}?accessKey=${result?.others?.accessKey}`,
      };
      setUrl(f.url);
      props.onChange(f);
    }
  };

  return (
    <Upload
      beforeUpload={props.beforeUpload}
      action={`/${SystemConst.API_BASE}/file/upload`}
      headers={{
        'X-Access-Token': Token.get(),
      }}
      multiple={false}
      onChange={handleChange}
      progress={{}}
    >
      <Input
        placeholder={props.placeholder}
        value={url || ''}
        readOnly
        addonAfter={<UploadOutlined />}
      />
    </Upload>
  );
});
export default FUpload;
