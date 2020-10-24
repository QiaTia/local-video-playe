/*
 * @Description: local-video-player
 * @Author: QiaTia
 * @Date: 2020-10-24 10:11:29
 * @LastEditors: QiaTia
 * @GitHub: https://github.com/QiaTia/
 * @LastEditTime: 2020-10-24 10:11:29
 */
import './tia.less'
import Notify from './notify'
import flvjs from 'flv.js/dist/flv.min'
import muxjs from 'mux.js'
import DPlayer from 'dplayer'

let latestURL = ''

const videoDom = document.getElementById('player')

const dragDom = document.getElementsByClassName('drag-wrap')[0]

const typeList = {
  "flv": "flv",
  "mp4": '',
  "avi": '',
  "ogm": '',
  "webm": "",
  "wmv": '',
  "mov": '',
  "mpeg": '',
  "m4v": '',
  "ts": ''
}

const dp = new DPlayer({ container: videoDom, video: {}, screenshot: true, autoplay: true })
dp.on('screenshot', ()=> Notify("截图功能会稍微有点卡顿, 请稍等"))

function handlePlayer(url, type = "") {
  latestURL = url
  dp.switchVideo({ url, type })
  videoDom.style.display = 'block'
  document.getElementsByClassName('container')[0].className = 'container is_play'
}

function upload({ target, dataTransfer }) {
  URL.revokeObjectURL(latestURL)
  const t = Notify.load("视频文件解析中~, 请稍等~", '')
  const [onError, onSuccess] = [e =>{
    t.hide()
    Notify.error(e)
    target.value = ''
  }, e =>{
    t.hide()
    Notify.sucess(`正在播放${ e }`)
    target.value = ''
  }]
  const [ file ] = target.files || dataTransfer.files || []
  if(!file) return ;
  const fileType = file.name.split('.').pop().toLowerCase()
  if(Object.keys(typeList).indexOf(fileType) == -1) return onError("请选择视频文件!")
  // const [ fileType, info ] = file.type.split('/')
  // if( fileType != "video") return onError("请选择视频文件!")
  if(fileType == 'ts') return readerFile(file).then(data=>transferFormat(data, ()=>onSuccess(file.name)))
  handlePlayer(URL.createObjectURL(file), typeList[fileType])
  onSuccess(file.name)
}

function readerFile(file) {
  return new Promise((resolve, reject)=>{
    //读取文件
    const fileReader = new FileReader()
    //转换文件为ArrayBuffer
    fileReader.readAsArrayBuffer(file)
    //监听完成事件
    fileReader.onload = ()=>resolve(fileReader.result)
    fileReader.onerror = reject
  })
}
function transferFormat (data, onSuccess) {
  // 将源数据从ArrayBuffer格式保存为可操作的Uint8Array格式
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
  const segment = new Uint8Array(data); 
  let remuxedSegments = [];
  let remuxedBytesLength = 0;
  let remuxedInitSegment = null;

  // remux选项默认为true，将源数据的音频视频混合为mp4，设为false则不混合
  const transmuxer = new muxjs.mp4.Transmuxer()
  
  // 监听data事件，开始转换流
  transmuxer.on('data', function(event) {
    remuxedSegments.push(event)
    remuxedBytesLength += event.data.byteLength
    remuxedInitSegment = event.initSegment
  })
  // 监听转换完成事件，拼接最后结果并传入MediaSource
  transmuxer.on('done', function () {
    var offset = 0;
    var bytes = new Uint8Array(remuxedInitSegment?.byteLength + remuxedBytesLength)
    bytes.set(remuxedInitSegment, offset);
    offset += remuxedInitSegment?.byteLength;

    for (var j = 0, i = offset; j < remuxedSegments.length; j++) {
      bytes.set(remuxedSegments[j].data, i);
      i += remuxedSegments[j]?.byteLength;
    }
    remuxedSegments = [];
    remuxedBytesLength = 0;
    // 解析出转换后的mp4相关信息，与最终转换结果无关
    // let vjsParsed = 
    muxjs.mp4.tools.inspect(bytes);
    // console.log('transmuxed', vjsParsed);
    prepareSourceBuffer(bytes)
    onSuccess()
  })
  // push方法可能会触发'data'事件，因此要在事件注册完成后调用
  transmuxer.push(segment) // 传入源二进制数据，分割为m2ts包，依次调用上图中的流程
  // flush的调用会直接触发'done'事件，因此要事件注册完成后调用
  transmuxer.flush() // 将所有数据从缓存区清出来
}

function prepareSourceBuffer (bytes) {
  // MediaSource Web API: https://developer.mozilla.org/zh-CN/docs/Web/API/MediaSource
  const mediaSource = new MediaSource();
  // video.src = URL.createObjectURL(mediaSource);
  handlePlayer(URL.createObjectURL(mediaSource))

  // $('#video-wrapper').appendChild(video); // 将H5 video元素添加到对应DOM节点下

  // 转换后mp4的音频格式 视频格式
  // const codecsArray = ["avc1.64001f", "mp4a.40.5"];

  mediaSource.addEventListener('sourceopen', function () {
    // MediaSource 实例默认的duration属性为NaN
    mediaSource.duration = 0;
    // 转换为带音频、视频的mp4
    const buffer = mediaSource.addSourceBuffer('video/mp4;codecs="' + 'avc1.64001f,mp4a.40.5' + '"');
    // 转换为只含视频的mp4
    // buffer = mediaSource.addSourceBuffer('video/mp4;codecs="' + codecsArray[0] + '"');
    // 转换为只含音频的mp4
    // buffer = mediaSource.addSourceBuffer('audio/mp4;codecs="' + (codecsArray[1] ||codecsArray[0]) + '"');
    const logevent = console.log

    buffer.addEventListener('updatestart', logevent);
    buffer.addEventListener('updateend', logevent);
    buffer.addEventListener('error', logevent);
    // video.addEventListener('error', logevent);
    // mp4 buffer 准备完毕，传入转换后的数据
    // 将 bytes 放入 MediaSource 创建的sourceBuffer中
    // https://developer.mozilla.org/en-US/docs/Web/API/SourceBuffer/appendBuffer
    buffer.appendBuffer(bytes)
    // 自动播放
  })
}


((w)=>{
  w.$upload = upload
  w.flvjs = flvjs
  const current = w.document.body
  // 拖拽进入
  current?.addEventListener("dragenter", ()=> dragDom.className = 'drag-wrap drag-in', false)
  // 拖拽结束
  current?.addEventListener("dragover", e => e.preventDefault(), false)
  // 拖拽离开
  current?.addEventListener("dragleave", ()=> dragDom.className = 'drag-wrap', false)
  dragDom?.addEventListener("dragenter", ()=> dragDom.className = 'drag-wrap', false)
  current?.addEventListener("dragend", e=> console.log(e), false)
  // 拖拽事件
  current?.addEventListener("drop", e=> {
    e.preventDefault()//取消事件的默认动作。
    dragDom.className = 'drag-wrap'
    // e.target = e.dataTransfer
    upload(e)
  },false)
})(window)

// export default $Tia