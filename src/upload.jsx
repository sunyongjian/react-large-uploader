import React from 'react';
import 'expose-loader?$!expose-loader?jQuery!jquery';
import WebUploader from '../web/webuploader.nolog.min';
import '../web/webuploader.css';
import './upload.css';


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

export default class BigUpload extends React.Component {
  constructor() {
    super();
    this.state = {
      fileList: [],
      uploadStatus: 'init',
      isMd5: false,
    };
    this.fileIds = [];
    this.complete = 0;
  }

  componentDidMount() {
    const { option } = this.props;
    const uploader = WebUploader.create({
      auto: false,
      chunked: true,
      chunkSize: 5 * 1024 * 1024,
      pick: '#picker',
      chunkRetry: 3,
      threads: 1,
      fileSizeLimit: 2000 * 1024 * 1024,
      fileSingleSizeLimit: 2000 * 1024 * 1024,
      ...option,
    });
    uploader.on('fileQueued', this.handleFileQueued);
    uploader.on('uploadBeforeSend', this.handleBeforeSend);
    uploader.on('uploadProgress', this.handleUploadProgress);
    uploader.on('uploadError', this.handleUploadError);
    uploader.on('uploadSuccess', this.handleUploadSuccess);
    this.uploader = uploader;
  }

  setFileItem = (key, value, id) => {
    const { fileList } = this.state;
    const copy = [...fileList];
    const result = copy.filter(item => item.id === id);
    if (result.length) {
      result[0][key] = value;
      this.setState({
        fileList: copy,
      });
    }
  }

  setUploadStatus = currying(this.setFileItem, 'uploadStatus')

  handleFileQueued = file => {
    const { fileList } = this.state;
    const { option: { auto } } = this.props;
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
        if (auto) this.uploader.upload(file.id);
      });
    this.setState({
      fileList: [...fileList, file],
    });
  }

  handleBeforeSend = (block, data) => {
    const file = block.file;
    const fileMd5 = file.md5Val;
    data.md5Value = fileMd5;
    this.setUploadStatus('process', file.id);
  }

  handleUploadProgress = (file, percentage) => {
    this.setFileItem('percentage', percentage, file.id);
  }

  handleUploadError = (file, reason) => {
    file.error = reason;
    this.props.onChange(file);
    this.setUploadStatus('error', file.id);
  }

  handleUploadSuccess = (file, res) => {
    file.response = res._raw;
    this.props.onChange(file);
    this.setUploadStatus('done', file.id);
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
    const result = fileList.filter((item) => item.id !== id);
    this.setState({
      fileList: result,
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
            <div className={barClassName} style={{ width: `${percentage * 100}%` }}>
            </div>
          </div>
        </div>
      );
    });
  }

  render() {
    const { children, border, name } = this.props;
    const value = border ? {} : { border: 'none' };
    return (<div>
      <div className="container" style={value}>
        <div className="file-list">
          {this.renderFileList()}
        </div>
        <div className="content" >
          <div id="picker">
            {children || <div className="btn-primary">选择文件</div>}
            <input
              type="file"
              name={name || 'file'}
              className="webuploader-element-invisible"
            />
          </div>
        </div>
      </div>
    </div>);
  }
}
