import * as Icon from './icon'

const $dom = document.createElement("div")
$dom.className = 'notify-container'
document.body.appendChild($dom)

class Notify {
  /**
 * @description: 全局Notify方法
 * @param {any} content
 * @param { string } title
 * @param { string } icon
 * @param { number } duration
 * @return: this
 */
  constructor(content, title, icon, duration ) {
    this._CB = []
    let data = { title, icon, duration}
    if(typeof content == 'string')  data['content'] = content
    else if(typeof content == 'object') data = { ...data, ...content }
    else return Promise.reject("Option Error!")
    return this.init(data)
  }
  init({ title = "提示", content, icon = "info", duration = 4500 }) {
    const NotifyDom = document.createElement("div")
    NotifyDom.className = 'notify-wrap ' + icon
    // <div class="notify-wrap ${icon}">
    NotifyDom.innerHTML = `<i class="icon">${Icon[icon]}</i><div class="content"><h3 class="title">${title}</h3><div class="msg">${content}</div></div><button class="btn">${Icon['error']}</button><div class="progress-bar"></div>`
    $dom.append(NotifyDom)
    this.Dom = NotifyDom
    // 点击回调
    NotifyDom.getElementsByClassName('btn')[0].onclick = e =>{
      this.hide()
      let cb
      while(cb = this._CB.shift()) cb(e)
    }
    this._hide = false
    this.$pro_dom = NotifyDom.getElementsByClassName('progress-bar')[0]
    setTimeout(()=> NotifyDom.style.transform = "translateX(0)", 0)
    duration&&setTimeout(()=>this.hide(), duration)
  }
  hide() {
    if(this._hide) return false
    this.Dom.style.transform = "translateX("+ this.Dom.offsetWidth +'px)'
    setTimeout(()=>($dom.removeChild(this.Dom)), 300)
    this._hide = true
  }
  onProgress(w) {
    if(this, this.$pro_dom) this.$pro_dom.style.width = w + "%"
  }
  then(Fn){
    this._CB.push(Fn)
    return this
  }
}

const notify = e => new Notify(e)

notify.test = content => notify({ content, duration: 0 })

notify.load = (content, title, duration = 0) => notify({ content, title, icon: 'load', duration })

notify.warn = (content, title, duration) => notify({ content, title, icon: 'warn', duration })

notify.error = (content, title, duration) => notify({ content, title, icon: 'error', duration })

notify.sucess = (content, title, duration) => notify({ content, title, icon: "sucess", duration })

export default notify