# Local Video Player

  http://a-b.icu

## 功能

一款播放本地视频的网页播放器, 集成了flv.js. mux.js. 可以本地播放浏览器支持的视频格式外还可以播放 *.flv, *.ts

## 兼容性

none

## 开始使用

```sh
npm insatll

npm run serve  // 本地调试 

npm run build  // 编译
```

## 注意事项

由于使用mux.js对 ts 视频进行转码处理播放, 所以播放.ts视频文件是可能会出现爆内存的状况.