import React from 'react';
import { render } from 'react-dom';
import LargeUploader from '../index';

const App = () => {
  const options = {
    resize: false,
    auto: true,
    server: '/upload',
    accept: {
      extensions: 'csv',
    },
  };
  const config = {
    title: '上传文件',
    options,
    width: 300,
    onChange: (file, list) => console.log(file, list),
    beforeFileQueued: (file) => {
      if (file.size === 0) {
        alert('不能上传空文件哦~');
        return false;
      }
      if (file.ext !== 'csv') {
        alert('只能上传csv哦~');
        return false;
      }
      return true;
    },
    fillDataBeforeSend: () => ({ fileType: '1' }),
    uploadResponse: (file, ret) => {
      const { code } = ret;
      return code === 0;
    },
  };

  return (
    <LargeUploader
      {...config}
    />
  );
};

render(<App />, document.getElementById('root'));

if (module.hot) {
  module.hot.accept();
}
