const zlib = require('zlib')
const fs = require('fs')

function gzipFile(filePath, outPath = '') {
  // if(!outPath) 
  outPath = filePath + '.gz'
  fs.createReadStream(filePath)
    .pipe(zlib.createGzip())
    .pipe(fs.createWriteStream(outPath))
    .on('finish', () => { //监听状态
      // console.log("end")
      fs.unlinkSync(filePath)
      fs.renameSync(outPath, filePath)
    })
}
// 复制文件操作
fs.createReadStream('./index.html')
  .pipe(fs.createWriteStream('./dist/index.html'))
  .on('finish', () => { //监听状态
    // console.log("end")
    gzipFile('./dist/index.js')
    gzipFile('./dist/index.html')
  })


console.log('\033[42;30m DONE \033[40;32m Building ~ ');
