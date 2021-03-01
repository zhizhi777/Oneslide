const $ = s => document.querySelector(s)
const $$ = s => document.querySelectorAll(s)

var initPDF = `## OneSlide

## 一

Markdown PPT

### 1

这是内容1

### 2

这是内容2

### 3

这是内容3

## 二

## 三

## end`
const isMain = str => /^#{1,2}(?!#)/.test(str)
const isSub = str => /^#{3}(?!#)/.test(str)
const convert= raw =>{
  let dataArr = raw.split(/\n(?=\s*#)/).filter(s => s!='').map(s => s.trim())
  let html = ''
  for(let i = 0; i < dataArr.length; i++){
    if(dataArr[i+1]){
      if(isMain(dataArr[i]) && isMain(dataArr[i+1])){
        html += `
        <section data-markdown>
          <textarea data-template>
            ${dataArr[i]}
          </textarea>
        </section>
        `
      }else if(isMain(dataArr[i]) && isSub(dataArr[i+1])){
        html += `
        <section>
          <section data-markdown>
            <textarea data-template>
              ${dataArr[i]}
            </textarea>
          </section>
        `
      }if(isSub(dataArr[i]) && isSub(dataArr[i+1])){
        html += `
        <section data-markdown>
          <textarea data-template>
            ${dataArr[i]}
          </textarea>
        </section>
        `
      }else if(isSub(dataArr[i]) && isMain(dataArr[i+1])){
        html += `
          <section data-markdown>
            <textarea data-template>
              ${dataArr[i]}
            </textarea>
          </section>
        </section>
        `
      }
    }else{
      if(isMain(dataArr[i])){
        html += `
        <section data-markdown>
          <textarea data-template>
            ${dataArr[i]}
          </textarea>
        </section>
        `
      }else if(isSub(dataArr[i])){
        html += `
          <section data-markdown>
            <textarea data-template>
              ${dataArr[i]}
            </textarea>
          </section>
        </section>
        `
      }
    }
  
  }
  
  return html
}

const Menu = {
  init(){
    console.log('Menu init..')
    this.$settingIcon = $('.control .icon-setting')
    this.$menu = $('.menu')
    this.$closeIcon = $('.menu .icon-close')
    this.$$tabs = $$('.menu .tab')
    this.$$contents = $$('.menu .content')

    this.bind()
  },

  bind(){
    this.$settingIcon.onclick = () =>{
      this.$menu.classList.add('active')
    }

    this.$closeIcon.onclick = () =>{
      this.$menu.classList.remove('active')
    }

    this.$$tabs.forEach(tab => {
      tab.onclick = () =>{
        this.$$tabs.forEach(tab => tab.classList.remove('active'))
        tab.classList.add('active')
        this.$$contents.forEach(content => content.classList.remove('active'))
        let index = [...this.$$tabs].indexOf(tab)
        this.$$contents[index].classList.add('active')
      }
    })
  }
}

const ImgUploader = {
  init(){
    this.$inputImg = $('#img-upload')

    AV.init({
      appId: "ts7QWr6RhDQ5aL3cFNvgE6cL-gzGzoHsz",
      appKey: "3L0QFNRupOlPV3sXb8HpBMEe",
      serverURL: "https://ts7qwr6r.lc-cn-n1-shared.com"
    })

    this.bind()
  },
  bind(){
    let self = this
    this.$inputImg.onchange = function() {
      if(this.files.length > 0){
        let localFile = this.files[0]   
        if(localFile.size/1048576 > 2){
          alert('文件不能超过2M')
          return
        }
        self.insertText(`![上传中，进度0%]()`)
        let avFile = new AV.File(encodeURI(localFile.name), localFile);
        avFile.save({
          keepFileName: true, 
          onprogress(progress) {
            self.insertText(`![上传中，进度${progress.percent}%]()`)
          }
        }).then(file => {
          console.log(`文件上传成功~`);
          let text = `![${file.attributes.name}](${file.attributes.url}?imageView2/0/w/800/h/600)`
          self.insertText(text)
        }, (error) => {
          console.log(error)
        });
      }
    }
  },
  insertText(text = ''){
    let $textarea = $('textarea')
    let start = $textarea.selectionStart
    let end = $textarea.selectionEnd
    let oldText = $textarea.value

    $textarea.value = `${oldText.substring(0, start)}${text}${oldText.substring(end)}`
    $textarea.focus()
    $textarea.setSelectionRange(start, start + text.length)
  }
} 

const Editor = {
  init(){
    console.log('Editor init...')
    this.saveBtn = $('.menu .btn-save')
    this.textarea = $('.menu textarea')
    this.slidesContainer = document.querySelector('.slides')
    // this.initText = localStorage.markdown || `# One Slide`
    this.initText = localStorage.markdown || initPDF
    
    this.bind()
    this.start()
  },

  bind(){
    this.saveBtn.onclick = () =>{
      localStorage.markdown = this.textarea.value
      location.reload()
    }
  },

  start(){
    this.textarea.value = this.initText
    this.slidesContainer.innerHTML = convert(this.initText)
    Reveal.initialize({
      controls: true,
      progress: true,
      center:  localStorage.align==='left-top' ? false : true,
      hash: true,

      transition: localStorage.transition || 'slide', // none/fade/slide/convex/concave/zoom

      // More info https://github.com/hakimel/reveal.js#dependencies
      dependencies: [
        { src: 'plugin/markdown/marked.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
        { src: 'plugin/markdown/markdown.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
        { src: 'plugin/highlight/highlight.js' },
        { src: 'plugin/search/search.js', async: true },
        { src: 'plugin/zoom-js/zoom.js', async: true },
        { src: 'plugin/notes/notes.js', async: true }
      ]
    });
  }
}

const Theme = {
  init() {
    this.$reveal = $('.reveal')
    this.$$themes = $$('.theme figure[data-theme]')
    this.$transition = $('.theme .transition')
    this.$align = $('.theme .align')

    this.bind()
    this.loadTheme()
  },
  bind(){
    this.$$themes.forEach($theme => {
      $theme.onclick = () =>{
        this.$$themes.forEach( $theme => $theme.classList.remove('select'))
        $theme.classList.add('select')
        this.setTheme($theme.dataset.theme)
      }
    })
    this.$transition.onchange = () => {
      this.setTransition(this.$transition.value)
    }
    this.$align.onchange = () => {
      this.setAlign(this.$align.value)
    }
  },
  setTheme(theme){
    localStorage.theme = theme
    location.reload()
  },
  setTransition(transition){
    localStorage.transition = transition
    location.reload()
  },
  setAlign(align){
    localStorage.align = align
    location.reload()
  },


  loadTheme(){
    let theme = localStorage.theme || 'blood'
    let $link = document.createElement('link')
    $link.rel = 'stylesheet'
    $link.href = `css/theme/${theme}.css`
    document.head.appendChild($link)

    // document.querySelector('.theme figure[data-theme=${theme}]').classList.add('select')
    Array.from(this.$$themes).find($theme => $theme.dataset.theme === theme).classList.add('select')
    this.$transition.value = localStorage.transition || 'slide'
    this.$align.value = localStorage.align || 'center'
    this.$reveal.classList.add(this.$align.value)
  }
}

const Print = {
  init(){
    this.$download = $('.tab-download')

    this.bind()
    this.start()
  },
    
  bind(){
    this.$download.addEventListener('click', () => {
      let $a = document.createElement('a')
      $a.setAttribute('target', '_blank')
      $a.setAttribute('href', location.href.replace(/#\/.*/,'?print-pdf'))

      $a.click()
    })
    window.onafterprint = () => window.close()
  },

  start(){
    let link = document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    // link.href = window.location.search.match(/print-pdf/gi) ? 'css/print/pdf.css' : 'css/print/paper.css'
    if(window.location.search.match(/print-pdf/gi)){
      link.href = 'css/print/pdf.css'
      window.print()
    }else{
      link.href = 'css/print/paper.css'
    }
    document.head.appendChild(link)
  }
}

const App = {
  init(){
    [...arguments].forEach(Module => Module.init())
  }
}

App.init(Menu, ImgUploader, Editor, Theme, Print)