const http = require('http');
const multer = require('multer');
const express = require('express');
const webpack = require('webpack');
const router = express.Router();
const app = express();

app.use(require('morgan')('short'));

// Step 1: Create & configure a webpack compiler
var webpackConfig = require(process.env.WEBPACK_CONFIG ? process.env.WEBPACK_CONFIG : './webpack.config');
var compiler = webpack(webpackConfig);

// Step 2: Attach the dev middleware to the compiler & the server
app.use(require("webpack-dev-middleware")(compiler, {
  noInfo: true, publicPath: webpackConfig.output.publicPath
}));

// Step 3: Attach the hot middleware to the compiler & the server
app.use(require("webpack-hot-middleware")(compiler, {
  path: '/__webpack_hmr',
}));

// Do anything you like with the rest of your express application.

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  },
});

const upload = multer({ storage: storage });

// server of file upload
var flag = true;
router.post('/upload', upload.any(), function (req, res, next) {
  console.log(req.body, '1111');
  if (req.files) {
    if(req.body.chunk > 10 && flag) {
      res.status(500).send('Something broke!');
      flag = false;
    } else {
      res.send({
        code: 0,
        data: {},
      });
    }
  }
});
app.use(router);

if (require.main === module) {
  var server = http.createServer(app);
  server.listen(process.env.PORT || 8888, function () {
    console.log("Listening on %j", server.address());
  });
}
