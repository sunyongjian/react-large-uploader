import React from 'react';
import PropTypes from 'prop-types';
import 'expose-loader?$!expose-loader?jQuery!jquery';
import WebUploader from '../web/webuploader.nolog.min';

const uploadStatusConfig = {
  init: {
    btn: '开始上传',
    clickName: 'upload',
    barClassName: 'process-bar',
  },
  md5: {
    btn: '计算md5中...',
    barClassName: 'process-bar',
  },
  process: {
    btn: '上传中 ...',
    barClassName: 'process-bar',
  },
  done: {
    btn: '上传完成',
    barClassName: 'process-bar success-bar',
  },
  error: {
    btn: '继续上传',
    clickName: 'retry',
    barClassName: 'process-bar error-bar',
  },
};

const currying = (fn, ...ahead) => (...behind) => fn(...ahead, ...behind);

export default class LargeUploader extends React.Component {
  static defaultProps = {
    options: {},
    onChange: () => {},
    width: 300,
    border: true,
    children: <div className="btn-primary" >选择文件</div>,
    beforeFileQueued: () => true,
    fillDataBeforeSend: () => ({}),
    uploadResponse: () => true,
  }

  static propTypes = {
    options: PropTypes.object,
    onChange: PropTypes.func,
    width: PropTypes.number,
    border: PropTypes.bool,
    children: PropTypes.element,
    beforeFileQueued: PropTypes.func,
    fillDataBeforeSend: PropTypes.func,
    uploadResponse: PropTypes.func,
  }

  constructor() {
    super();
    this.state = {
      fileList: [],
    };
  }

  componentDidMount() {
    const { options } = this.props;
    const uploader = WebUploader.create({
      chunked: true,
      chunkSize: 5 * 1024 * 1024,
      pick: '#picker',
      chunkRetry: 3,
      threads: 1,
      fileSizeLimit: 2000 * 1024 * 1024,
      fileSingleSizeLimit: 2000 * 1024 * 1024,
      ...options,
      auto: false,
    });
    uploader.on('beforeFileQueued', this.handleBeforeFileQueued);
    uploader.on('fileQueued', this.handleFileQueued);
    uploader.on('uploadBeforeSend', this.handleBeforeSend);
    uploader.on('uploadProgress', this.handleUploadProgress);
    uploader.on('uploadAccept', this.handleUploadAccept);
    uploader.on('uploadError', this.handleUploadError);
    uploader.on('uploadSuccess', this.handleUploadSuccess);
    this.uploader = uploader;
  }

  setFileItem = (key, value, id) => {
    return new Promise((resolve) => {
      const { fileList } = this.state;
      const copy = [...fileList];
      const result = copy.filter(item => item.id === id);
      if (result.length) {
        result[0][key] = value;
        this.setState({
          fileList: copy,
        }, () => { resolve(); });
      }
    });
  }

  setUploadStatus = currying(this.setFileItem, 'uploadStatus')

  handleBeforeFileQueued = file => {
    const { beforeFileQueued } = this.props;
    return beforeFileQueued(file);
  }

  handleFileQueued = file => {
    const { fileList } = this.state;
    const { options: { auto } } = this.props;
    file.percentage = 0;
    file.uploadStatus = 'md5';
    this.uploader.md5File(file)
      .progress(() => {
        this.setUploadStatus('md5', file.id);
      })
      // 完成
      .then((val) => {
        this.setUploadStatus('init', file.id);
        this.setFileItem('md5Val', val, file.id);
        if (auto && file.uploadStatus !== 'done') this.uploader.upload(file, file.id);
      });
    this.setState({
      fileList: [...fileList, file],
    });
  }

  handleBeforeSend = (block, data) => {
    const { file: { md5Val, id }, chunks } = block;
    const { fillDataBeforeSend } = this.props;
    const v = fillDataBeforeSend();
    Object.assign(data, v);
    if (chunks === 1) { // 未切片的加入默认值
      data.chunks = 1;
      data.chunk = 0;
    }
    // data 中 加入 md5 值
    data.md5Value = md5Val;
    this.setUploadStatus('process', id);
  }

  handleUploadProgress = (file, percentage) => {
    this.setFileItem('percentage', percentage, file.id);
  }

  handleUploadAccept = (file, ret) => {
    const { uploadResponse } = this.props;
    return uploadResponse(file, ret);
  }

  handleUploadError = (file, reason) => {
    file.error = reason;
    this.setUploadStatus('error', file.id).then(() => {
      this.props.onChange(file, this.state.fileList);
    });
  }

  handleUploadSuccess = (file, res) => {
    file.response = res._raw;
    this.setUploadStatus('done', file.id).then(() => {
      this.props.onChange(file, this.state.fileList);
    });
  }

  upload = (id) => () => {
    this.uploader.upload(id);
  }

  retry = (id) => () => {
    this.setUploadStatus('process', id);
    this.uploader.retry(this.uploader.getFile(id));
  }

  deleteFile = (id) => () => {
    const { fileList } = this.state;
    const index = fileList.findIndex((item) => item.id === id);
    const curFile = fileList[index];
    fileList.splice(index, 1);
    this.setState({
      fileList,
    }, () => {
      this.props.onChange(curFile, this.state.fileList);
    });
    this.uploader.removeFile(this.uploader.getFile(id, true));
  }

  renderFileList() {
    const { fileList } = this.state;
    return fileList.map((item) => {
      const { id, name, percentage, uploadStatus } = item;
      const { clickName, btn, barClassName } = uploadStatusConfig[uploadStatus];
      return (
        <div key={id} className="file-item" >
          <span className="file-name">{name}</span>
          <span className={`file-status ${uploadStatus}-status`} onClick={this[clickName] ? this[clickName](id) : null}>{btn}</span>
          <span className="delete" onClick={this.deleteFile(id)}>x</span>
          <div className="process">
            <div className={barClassName} style={{ width: `${percentage * 100}%` }} />
          </div>
        </div>
      );
    });
  }

  render() {
    const { children, border, width } = this.props;
    const style = border ? { width } : { width, border: 'none' };
    return (<div>
      <div className="large-uploader" style={style}>
        <div className="file-list">
          {this.renderFileList()}
        </div>
        <div className="content" >
          <div id="picker">
            {children}
          </div>
        </div>
      </div>
    </div>);
  }
}
