/**
 * @description: 全局Toats方法
 * @param {type} 
 * @return: this
 */
import * as Icon from './icon'

class Toast {
  constructor(data){
    if(!data) return this
    this._CB = []
    typeof data == 'string'&& (data = {title: data})
    return this.init({ duration: 4500, icon: 'info', ...data})
  }
  init({title, icon, duration, btn='close' }) {
    // const id = 'via_' + Math.ceil(Math.round(Math.random() * 9999)),
    const div = document.createElement("div")
    div.innerHTML = `<i class="tia-icon ${icon}">${Icon[icon]||''}</i><p>${title}</p><span class="btn">${btn}</span>`
    // div.setAttribute("id", id);
    div.setAttribute('class','tia-toast')
    document.body.appendChild(div)
    this.Dom = div // document.getElementById(id)
    // 点击回调
    this.Dom.getElementsByClassName('btn')[0].onclick = (e)=>{
      this.hide()
      let cb
      while(cb = this._CB.shift()) cb(e)
    }
    this._hide = false
    setTimeout(()=> this.Dom.style.bottom = 0 ,0)
    duration&&setTimeout(()=>this.hide(), duration)
  }
  hide() {
    if(this._hide) return false
    this.Dom.style.bottom = -this.Dom.offsetHeight+'px'
    setTimeout(()=>(this.Dom.parentNode.removeChild(this.Dom)),300)
    this._hide = true
  }
  then(Fn){
    this._CB.push(Fn)
    return this
  }
}

const toast = e => new Toast(e)

toast.load = title => toast({ title, icon: 'load', duration: 0 })

toast.warn = title => toast({ title, icon: 'warn' })

toast.error = title => toast({ title, icon: 'error' })

toast.sucess = title => toast({ title, icon: "sucess" })

export default toast