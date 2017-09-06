## introduction
> 依赖 webuploader 做的 react 大文件切割上传组件。由于 webuploader 依赖 jq，所以



## doc
### Props
- option
object
初始化 webuploader 的配置对象
默认
```javascript
{
  auto: false,   // 选完文件自动上传
  chunked: true,  // 是否切割
  chunkSize: 5 * 1024 * 1024,  // 切片大小
  chunkRetry: 3,  // 切片上传失败重试次数
  threads: 1,
  fileSizeLimit: 2000 * 1024 * 1024,
  fileSingleSizeLimit: 2000 * 1024 * 1024,
}
```

- width

number
默认 300

- border

bool
是否显示边框

- onChange(file)
function

当文件上传成功或者失败的时候，调用。参数是 file 对象：
```
ext:  后缀名
id:  文件id
lastModifiedDate:  最后修改时间
name:  文件名
size:  文件大小
percentage:  百分百
source:  源
uploadStatus:  状态(成功/失败)
type:  mime 类型 
```

