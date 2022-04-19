import './index.less';

const Email = () => {
  return (
    <div className={'doc'}>
      <h1>1. 概述</h1>
      <div>
        通知配置可以结合通知配置为告警消息通知提供支撑。也可以用于系统中其他自定义模块的调用。
      </div>
      <h1>2.通知配置说明</h1>
      <h2>1. 服务器地址</h2>
      <div>下拉可选择国内常用的邮箱服务配置，也支持手动输入其他地址。</div>
      <div>
        系统POP协议。POP允许电子邮件客户端下载服务器上的邮件，但是您在电子邮件客户端的操作（如：移动邮件、标记已读等），这是不会反馈到服务器上。
      </div>
      <h2>2. 发件人</h2>
      <div>用于发送邮件时“发件人“信息的显示</div>
      <h2>3. 用户名</h2>
      <div>用该账号进行发送邮件。</div>
      <h2>4. 密码</h2>
      <div>用与账号身份认证，认证通过后可通过该账号进行发送邮件。</div>
    </div>
  );
};
export default Email;
