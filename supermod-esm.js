/* eslint-disable no-debugger, spaced-comment, no-multi-spaces, valid-typeof, no-trailing-spaces,
   object-curly-spacing,  indent, new-cap, block-spacing, comma-spacing, handle-callback-err, 
   no-return-assign, camelcase, yoda, object-property-newline, no-floating-decimal, import/first, 
   standard/array-bracket-even-spacing, object-curly-newline, no-void, quotes */
   
/* ### http://prex.mork.work ######################
   server { listen 443 ssl; server_name prex.mork.work; include fav.conf;
     location / {root "c:/13/custom/chrome extensions/chromever/";
       include mime.types;
       add_header X-men 's:prex' always; 
       include nginx-no-cors.conf;
     }
     include nginx-https-proxy-cert.conf; }   
*/   

const loc = window.location.href
const sloc = loc.substr(0, 80)
const scripts = {}
let isManifest = false
let log
 
const initSiteScripts = async sitekey => {
  const Corelib = await import('https://pres.mork.work/res/esm/stdlib/corelib-esm.js')
  const DOMplusUltra = await import('https://pres.mork.work/res/esm/dom/dom-plus-ultra-esm.js')

  const {getRndDig, clamp} = Corelib
  const {schedule, startEndThrottle} = Corelib.Tardis
  const {wassert, weject, brexru} = Corelib.Debug //eslint-disable-line no-unused-vars
  const {$, div$, set$, createSheet} = DOMplusUltra //eslint-disable-line no-unused-vars
  const {min, max, round, sqrt} = Math //eslint-disable-line no-unused-vars

  const superModFp = getRndDig(3)
  
  const st = isManifest ? `background:#efe;border:1px solid #8f8;` : ``

  log = (...args) => console.log(`%c👽supermod(${superModFp}): ` + args.shift(), st, ...args)

  //log('start', sloc, document.body.getAttribute('sitekey'))

  //%The scripts
    
  scripts.pannonrex = async _ => {
    const pr = {}
    const percentize = (arr, maxwi, fromParent = false, doCol = false) => arr.each((_, o) => {
      const starr = o.getAttribute('style').split(';')
      const turul = []
      let hasChanged = false
      for (const rule of starr) {
        if (rule.includes('px') && (rule.includes('left') || rule.includes('width'))) {
          const wi = fromParent ? o.parentElement.clientWidth : maxwi
          const [prop, val] = rule.split(':')
          const pt = parseInt(val) * 100 / wi
          turul.push(prop + ':' + pt.toFixed(3) + '%')
          doCol && turul.push(`--hue: ${round(pt * 1.2)}`)
          hasChanged = true
        } else {
          turul.push(rule)
        }
      }
      hasChanged && o.setAttribute('style', turul.join(';'))
    })
    const safeResize = startEndThrottle(css => {
      set$(pr.a1, {css})
      set$(pr.a2, {css})
      set$(pr.a3, {css})
    }, 50)
    schedule(3000).then(_ => {
      inject.fonts('roboto')
      inject.stylesheet(`//prex.mork.work/css/pannonrex.css`, `pannonrex-css`)
      pr.zoomer$ = div$(document.body, {class: 'zoomer', on: {mousemove: event => {
        if (event.buttons & 1) {
          const {target, offsetX} = event
          const {clientWidth} = target
          const pct = clamp(offsetX / clientWidth, .01, 1)
          const nuwi = round(2 * pr.cw * pct)
          if (nuwi !== pr.nuwi) {
            pr.nuwi = nuwi
            safeResize({width: nuwi + 'px'})
            set$(pr.zoomer$, {css: {__pt: pct * 100 + '%'}})  
          }
        }
      }}})
    })
    const tick = async _ => {
      pr.a1 = $('[id=pmap-gthdc-r]')[0]
      pr.a2 = $('[id=pmap-gbdcc-r]')[0]
      pr.a3 = $('[id=pmap-sccn-r]')[0]
      if (pr.a1 && pr.a2 && pr.a3) {
        pr.cw1 = pr.a1.clientWidth
        if (pr.cw1 && !pr.cw) {
          pr.cw = pr.cw1
        }
        if (pr.cw) {
          percentize($('.pmap-gcal-bar-pct'), 0, true, true)
          percentize($('[id=gantt_link]'), pr.cw)
          percentize($('.pmap-gcal-bar'), pr.cw)
          percentize($('.pmap-gcal-bar-sum'), pr.cw)
          percentize($('.pmap-gcal-bar-ms'), pr.cw)
        }
      }
      schedule(1000).then(tick)
    }
    schedule(3000).then(tick)
  }
    
  //%Inline injector engine

  const inject = {}

  inject.contentScript = (contentScript, id) => {
    const script = document.createElement('script')
    script.src = contentScript
    script.async = true
    script.setAttribute('type', 'module')
    script.setAttribute('id', id)
    document.head.appendChild(script)
  }
  inject.stylesheet = (link, id) => {
    const style = document.createElement('link')
    style.setAttribute('rel', 'stylesheet')
    style.setAttribute('href', link)
    style.setAttribute('id', id)
    document.getElementsByTagName('head')[0].appendChild(style)
  }
  inject.fonts = family => {
    if (family === 'roboto') {
      inject.stylesheet('//fonts.googleapis.com/css2?family=Roboto:' +
        'ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap', 'sup-roboto')
      inject.stylesheet('//fonts.googleapis.com/css2?family=Roboto+Condensed:' +
        'ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap', 
        'sup-robotocondensed')
    } else if (family === 'noto') {
      inject.stylesheet('//fonts.googleapis.com/css2?family=Noto+Serif:' +
        'ital,wght@0,400;0,700;1,400;1,700&display=swap',
        'sup-noto')
    } else if (family === 'sourceserifpro') {
    inject.stylesheet('//fonts.googleapis.com/css2?family=Source+Serif+Pro:',
      'ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700;1,900&display=swap', 
      'sup-ssp')
    } else {
      return
    }
    log(`${family} font family injected`)
  }
}

const isInteractive = _ => ['complete', 'interactive'].includes(document.readyState)
const isComplete = _ => document.readyState === 'complete'

const onInteractive = _ => new Promise(resolve => isInteractive()
  ? resolve()
  : document.addEventListener('readystatechange', _ => isInteractive() && resolve()))
  
const onComplete = _ => new Promise(resolve => isComplete()
  ? resolve()
  : document.addEventListener('readystatechange', _ => isComplete() && resolve()))

const scriptExec = async (oncomplete, script, sitekey) => {
  oncomplete && await onComplete()
  log(`executing script [${sitekey}], readyState at start:`, document.readyState)
  script()
}

const init = async _ => {
  await onInteractive()
  const supermodLoaded = document.body.getAttribute('supermodloaded')
  const sitekey = document.body.getAttribute('sitekey')
  
  if (supermodLoaded) {//:manifest called this but too late, already injected OK
    console.log('MANIFEST supermod will be skipped', {sitekey, sloc})
    return
  }// else {
  if (!sitekey) {//:manifest on non matching page
    console.log('MANIFEST supermod on non matching page, skip!', {sloc})
    return
  } else if (['messenger'].includes(sitekey || 'zzz')) {//:MANIFEST must run
    console.log('MANIFEST supermod will run', {sitekey})  
    isManifest = true
  } else {
    console.log('Injected supermod will run', {sitekey, sloc})
  //:normal injected will run
  }
  const oncomplete = document.body.getAttribute('oncomplete')
  document.body.setAttribute('supermodloaded', 1)
  
  await initSiteScripts(sitekey)
  log('attr', {sitekey, oncomplete, sloc: loc.substr(0, 50)})
    
  scripts[sitekey]
    ? scriptExec(oncomplete, scripts[sitekey], sitekey)
    : log(`No scripts.${sitekey} defined!`)
  document.body.setAttribute('fact', '👽 All your base are belong to us.')
}

init()
