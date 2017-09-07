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
      border
      width={300}
      onChange={(file) => console.log(file)}
    />
  );
};

render(<App />, document.getElementById('root'));

if (module.hot) {
  module.hot.accept();
}
