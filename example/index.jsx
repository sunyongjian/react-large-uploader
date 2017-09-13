import React from 'react';
import { render } from 'react-dom';
import BigUpload from '../src/upload.jsx';

const App = () => {
  const options = {
    resize: false,
    auto: true,
    server: '/upload',
    accept: {
      extensions: 'csv',
    },
  };
  return (
    <BigUpload
      options={options}
      border
      width={300}
      onChange={(file) => console.log(file)}
      beforeFileQueued={(file) => {
        if (file.size === 0) {
          alert('不能上传空文件哦~');
          return false;
        }
        if (file.ext !== 'csv') {
          alert('只能上传csv哦~');
          return false;
        }
        return true;
      }}
    />
  );
};

render(<App />, document.getElementById('root'));

if (module.hot) {
  module.hot.accept();
}
