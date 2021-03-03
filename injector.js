/* eslint-disable no-debugger, spaced-comment, no-multi-spaces, no-unused-vars, valid-typeof, 
   object-curly-spacing, no-trailing-spaces, indent, new-cap, block-spacing, comma-spacing,
   handle-callback-err, no-return-assign, camelcase, yoda, object-property-newline,
   standard/array-bracket-even-spacing, object-curly-newline, no-void, quotes,
   no-multiple-empty-lines */

const injectContentScript = contentScript => {
  const fingerPrint = 'id' + Date.now()
  const script = document.createElement('script')
  script.src = contentScript
  script.async = true
  script.setAttribute('type', 'module')
  script.setAttribute('id', fingerPrint)
  if (typeof document.head === 'undefined') {
    console.error(`💉supermod.injector: document.head is undef!`)
    debugger
    setTimeout(_ => injectContentScript(contentScript), 1000)
  }
  document.head.appendChild(script)
}

const onReadyState = _ => new Promise(resolve => {
  document.getElementsByTagName('head').length
    ? resolve()
    : document.addEventListener('readystatechange', _ => {
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
          resolve()
        }
      })
  })

const konfig = {
  contentScript: 'https://prex.mork.work/supermod-esm.js' 
}

const sites = {
  pannonrex: {type: 'include', pattern: 'pannonrex.com/demos/ganttDemo', oncomplete: true}
}

onReadyState().then(_ => {
  const loc = window.location.href
  const sloc = loc.substr(0, 90)
  
  const siteMatched = site => {
    const {pattern} = site
    if (site.type === 'include') {
      return loc.includes(pattern)
    } else if (site.type === 'includeall') {
      return pattern.length === pattern.filter(pat => loc.includes(pat)).length
    } else if (site.type === 'includeany') {
      return pattern.filter(pat => loc.includes(pat)).length
    }
  }
  
  for (const sitekey in sites) {
    const site = sites[sitekey]
    if (siteMatched(site)) {
      console.log(`💉supermod.injector will inject supermod now on match:`, sitekey, sloc)
      window.expo = 'hellomi!'
      document.body.setAttribute('sitekey', sitekey)
      site.oncomplete && document.body.setAttribute('oncomplete', 'true')
      injectContentScript(konfig.contentScript)
      break
    }
  }
})
