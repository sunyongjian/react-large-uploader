import React from 'react';
import { render } from 'react-dom';
import BigUpload from '../src/upload.jsx';

const App = () => {
  const options = {
    resize: false,
    auto: true,
    server: '/upload',
  };
  return (
    <BigUpload
      options={options}
      border={true}
      width={300}
      onChange={(file) => console.log(file)}
    >
      <div className="btn-primary">选择文件</div>
    </BigUpload>
  );
};

render(<App />, document.getElementById('root'));

if (module.hot) {
  module.hot.accept();
}
