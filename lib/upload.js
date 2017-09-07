'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

require('expose-loader?$!expose-loader?jQuery!jquery');

var _webuploaderNolog = require('../web/webuploader.nolog.min');

var _webuploaderNolog2 = _interopRequireDefault(_webuploaderNolog);

require('../web/webuploader.css');

require('./upload.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var uploadStatusConfig = {
  init: {
    btn: '开始上传',
    clickName: 'upload',
    barClassName: 'process-bar'
  },
  md5: {
    btn: '计算md5中...',
    barClassName: 'process-bar'
  },
  process: {
    btn: '上传中 ...',
    barClassName: 'process-bar'
  },
  done: {
    btn: '上传完成',
    barClassName: 'process-bar success-bar'
  },
  error: {
    btn: '继续上传',
    clickName: 'retry',
    barClassName: 'process-bar error-bar'
  }
};

var currying = function currying(fn) {
  for (var _len = arguments.length, ahead = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    ahead[_key - 1] = arguments[_key];
  }

  return function () {
    for (var _len2 = arguments.length, behind = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      behind[_key2] = arguments[_key2];
    }

    return fn.apply(undefined, ahead.concat(behind));
  };
};

var BigUpload = function (_React$Component) {
  _inherits(BigUpload, _React$Component);

  function BigUpload() {
    _classCallCheck(this, BigUpload);

    var _this = _possibleConstructorReturn(this, (BigUpload.__proto__ || Object.getPrototypeOf(BigUpload)).call(this));

    _this.setFileItem = function (key, value, id) {
      var fileList = _this.state.fileList;

      var copy = [].concat(_toConsumableArray(fileList));
      var result = copy.filter(function (item) {
        return item.id === id;
      });
      if (result.length) {
        result[0][key] = value;
        _this.setState({
          fileList: copy
        });
      }
    };

    _this.setUploadStatus = currying(_this.setFileItem, 'uploadStatus');

    _this.handleFileQueued = function (file) {
      var fileList = _this.state.fileList;
      var auto = _this.props.options.auto;

      file.percentage = 0;
      file.uploadStatus = 'md5';
      _this.uploader.md5File(file).progress(function () {
        _this.setUploadStatus('md5', file.id);
      })
      // 完成
      .then(function (val) {
        _this.setUploadStatus('init', file.id);
        _this.setFileItem('md5Val', val, file.id);
        if (auto && file.uploadStatus !== 'done') _this.uploader.upload(file, file.id);
      });
      _this.setState({
        fileList: [].concat(_toConsumableArray(fileList), [file])
      });
    };

    _this.handleBeforeSend = function (block, data) {
      var file = block.file;
      var fileMd5 = file.md5Val;
      data.md5Value = fileMd5;
      _this.setUploadStatus('process', file.id);
    };

    _this.handleUploadProgress = function (file, percentage) {
      _this.setFileItem('percentage', percentage, file.id);
    };

    _this.handleUploadError = function (file, reason) {
      file.error = reason;
      _this.props.onChange(file);
      _this.setUploadStatus('error', file.id);
    };

    _this.handleUploadSuccess = function (file, res) {
      file.response = res._raw;
      _this.props.onChange(file);
      _this.setUploadStatus('done', file.id);
    };

    _this.upload = function (id) {
      return function () {
        _this.uploader.upload(id);
      };
    };

    _this.retry = function (id) {
      return function () {
        _this.setUploadStatus('process', id);
        _this.uploader.retry(_this.uploader.getFile(id));
      };
    };

    _this.deleteFile = function (id) {
      return function () {
        var fileList = _this.state.fileList;

        var result = fileList.filter(function (item) {
          return item.id !== id;
        });
        _this.setState({
          fileList: result
        });
        _this.uploader.removeFile(_this.uploader.getFile(id, true));
      };
    };

    _this.state = {
      fileList: [],
      uploadStatus: 'init',
      isMd5: false
    };
    _this.fileIds = [];
    _this.complete = 0;
    return _this;
  }

  _createClass(BigUpload, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var options = this.props.options;

      var uploader = _webuploaderNolog2.default.create(_extends({
        chunked: true,
        chunkSize: 5 * 1024 * 1024,
        pick: '#picker',
        chunkRetry: 3,
        threads: 1,
        fileSizeLimit: 2000 * 1024 * 1024,
        fileSingleSizeLimit: 2000 * 1024 * 1024
      }, options, {
        auto: false
      }));
      uploader.on('fileQueued', this.handleFileQueued);
      uploader.on('uploadBeforeSend', this.handleBeforeSend);
      uploader.on('uploadProgress', this.handleUploadProgress);
      uploader.on('uploadError', this.handleUploadError);
      uploader.on('uploadSuccess', this.handleUploadSuccess);
      this.uploader = uploader;
    }
  }, {
    key: 'renderFileList',
    value: function renderFileList() {
      var _this2 = this;

      var fileList = this.state.fileList;

      return fileList.map(function (item) {
        var id = item.id,
            name = item.name,
            percentage = item.percentage,
            uploadStatus = item.uploadStatus;
        var _uploadStatusConfig$u = uploadStatusConfig[uploadStatus],
            clickName = _uploadStatusConfig$u.clickName,
            btn = _uploadStatusConfig$u.btn,
            barClassName = _uploadStatusConfig$u.barClassName;

        return _react2.default.createElement(
          'div',
          { key: id, className: 'file-item' },
          _react2.default.createElement(
            'span',
            { className: 'file-name' },
            name
          ),
          _react2.default.createElement(
            'span',
            { className: 'file-status ' + uploadStatus + '-status', onClick: _this2[clickName] ? _this2[clickName](id) : null },
            btn
          ),
          _react2.default.createElement(
            'span',
            { className: 'delete', onClick: _this2.deleteFile(id) },
            'x'
          ),
          _react2.default.createElement(
            'div',
            { className: 'process' },
            _react2.default.createElement('div', { className: barClassName, style: { width: percentage * 100 + '%' } })
          )
        );
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          children = _props.children,
          border = _props.border,
          name = _props.name;

      var value = border ? {} : { border: 'none' };
      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'div',
          { className: 'container', style: value },
          _react2.default.createElement(
            'div',
            { className: 'file-list' },
            this.renderFileList()
          ),
          _react2.default.createElement(
            'div',
            { className: 'content' },
            _react2.default.createElement(
              'div',
              { id: 'picker' },
              children || _react2.default.createElement(
                'div',
                { className: 'btn-primary' },
                '\u9009\u62E9\u6587\u4EF6'
              ),
              _react2.default.createElement('input', {
                type: 'file',
                name: name || 'file',
                className: 'webuploader-element-invisible'
              })
            )
          )
        )
      );
    }
  }]);

  return BigUpload;
}(_react2.default.Component);

exports.default = BigUpload;
//# sourceMappingURL=upload.js.map