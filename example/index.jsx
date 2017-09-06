import React from 'react';
import { render } from 'react-dom';
import BigUpload from '../src/upload.jsx';

const App = () => {
  const option = {
    resize: false,
    server: '/upload',
  };
  return (
    <BigUpload
      option={option}
      border={false}
      width={300}
      onChange={(obj) => console.log(obj)}
    >
      <div>选择</div>
    </BigUpload>
  );
};

render(<App />, document.getElementById('root'));

if (module.hot) {
  module.hot.accept();
}
