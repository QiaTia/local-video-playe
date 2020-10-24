const path = require('path')
// const env = process.env.NODE_ENV
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = {
  // mode: 'production', // development
  entry: { 'index': './src/index.js' },
  devtool: false,
  plugins: [
    // new BundleAnalyzerPlugin({ analyzerPort: 8919 }),
    new MiniCssExtractPlugin(),
    new OptimizeCSSAssetsPlugin({
      assetNameRegExp: /\.optimize\.css$/g,
      cssProcessor: require('cssnano'), //引入cssnano配置压缩选项
      cssProcessorPluginOptions: {
        preset: ['default', { discardComments: { removeAll: true } }],
      },
      canPrint: true //是否将插件信息打印到控制台
    })
    // new OptimizeCSSAssetsPlugin()
  ],
  optimization: {
    minimizer: [
      new UglifyJsPlugin(),
      // new OptimizeCSSAssetsPlugin({
      //   cssProcessor: require('cssnano'), //引入cssnano配置压缩选项
      //   cssProcessorOptions: { 
      //     discardComments: { removeAll: true } 
      //   },
      //   canPrint: true //是否将插件信息打印到控制台
      // })
    ],
  },
  module: {
    rules: [
      {test: /\.[le]|[c]ss$/,use: ['style-loader',
        // 拆除css 
        // MiniCssExtractPlugin.loader,
        'css-loader', "postcss-loader", 'less-loader']},
      {
        test: /\.js$/,
        use: { loader: 'babel-loader'},
        exclude:'/node_modules/'
      }
    ]
  },
  output: {
    path:  path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  devServer:{
    //服务器的IP地址，可以使用IP也可以使用localhost
    host:'localhost',
    //服务端压缩是否开启
    compress:true,
    filename: '[name].js',
    //配置服务端口号
    port:8080,
    // 实时刷新  
    // inline: true,
    hot: true,
    proxy: {
      '/api': {// '/api':匹配项
        target: 'https://wx.qiatia.cn/',// 接口的域名
        secure: false,// 如果是https接口，需要配置这个参数
        changeOrigin: true,// 如果接口跨域，需要进行这个参数配置p
        // pathRewrite: {// 如果接口本身没有/api需要通过pathRewrite来重写了地址
        //   '^api': ''
        // }
      }
    }
  }
}