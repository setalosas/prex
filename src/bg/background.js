/* eslint-disable no-trailing-spaces, eqeqeq, no-useless-escape, eol-last, 
   object-curly-spacing, spaced-comment, no-debugger */
/* globals chrome, fetch */

'use strict'

const buildRules = ruleTuples => ruleTuples.map(tuple => ({ name: tuple[0], rule: tuple[1] }))

function getBrowserRules () {
  return buildRules([
    [ 'aol', /AOLShield\/([0-9\._]+)/ ],
    [ 'edge', /Edge\/([0-9\._]+)/ ],
    [ 'yandexbrowser', /YaBrowser\/([0-9\._]+)/ ],
    [ 'vivaldi', /Vivaldi\/([0-9\.]+)/ ],
    [ 'kakaotalk', /KAKAOTALK\s([0-9\.]+)/ ],
    [ 'samsung', /SamsungBrowser\/([0-9\.]+)/ ],
    [ 'chrome', /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/ ],
    [ 'phantomjs', /PhantomJS\/([0-9\.]+)(:?\s|$)/ ],
    [ 'crios', /CriOS\/([0-9\.]+)(:?\s|$)/ ],
    [ 'firefox', /Firefox\/([0-9\.]+)(?:\s|$)/ ],
    [ 'fxios', /FxiOS\/([0-9\.]+)/ ],
    [ 'opera', /Opera\/([0-9\.]+)(?:\s|$)/ ],
    [ 'opera', /OPR\/([0-9\.]+)(:?\s|$)$/ ],
    [ 'ie', /Trident\/7\.0.*rv\:([0-9\.]+).*\).*Gecko$/ ],
    [ 'ie', /MSIE\s([0-9\.]+);.*Trident\/[4-7].0/ ],
    [ 'ie', /MSIE\s(7\.0)/ ],
    [ 'bb10', /BB10;\sTouch.*Version\/([0-9\.]+)/ ],
    [ 'android', /Android\s([0-9\.]+)/ ],
    [ 'ios', /Version\/([0-9\._]+).*Mobile.*Safari.*/ ],
    [ 'safari', /Version\/([0-9\._]+).*Safari/ ],
    [ 'facebook', /FBAV\/([0-9\.]+)/ ],
    [ 'instagram', /Instagram\s([0-9\.]+)/ ],
    [ 'ios-webview', /AppleWebKit\/([0-9\.]+).*Mobile/ ]
  ])
}

function parseUserAgent (userAgentString) {
  var browsers = getBrowserRules()
  if (!userAgentString) {
    return null
  }

  var detected = browsers.map(function (browser) {
    var match = browser.rule.exec(userAgentString)
    var version = match && match[1].split(/[._]/).slice(0, 4)

    if (version && version.length < 4) {
      version = version.concat([0, 0, 0].slice(0, 4 - version.length))
    }

    return match && {
      name: browser.name,
      version: version.join('.')
    }
  }).filter(Boolean)[0] || null

  if (/alexa|bot|crawl(er|ing)|facebookexternalhit|feedburner|google web preview|nagios|postrank|pingdom|slurp|spider|yahoo!|yandex/i.test(userAgentString)) {
    detected = detected || {}
    detected.bot = true
  }

  return detected
}

function detect () {
  if (typeof navigator !== 'undefined') {
    return parseUserAgent(navigator.userAgent)
  }
}

function isChromium () { 
  if (navigator && navigator.plugins) {
    for (let a of navigator.plugins) {
      if (a.name && a.name.includes('Chromium')) {
        return true
      }
    }
  }
  return false
}

// Chrome     71.0.3578.80
// Chrome Dev 72.0.3626.14
// Canary     73.0.3638.0
// Chromium   72.0.3615.0

;(async () => {
  try {  
    const [omaha, woolyssRaw] = await Promise.all([
      fetch('https://omahaproxy.appspot.com/all.json').then(response => response.json()),
      fetch('https://chromium.woolyss.com/download/en/').then(response => response.text())
    ])
    const woolyss = woolyssRaw.substr(woolyssRaw.indexOf('Version: ') + 9, 20).split('<')[0]
    run(omaha, woolyss)  
  } catch (error) {
    console.log(error)
  }
})()

const run = (data, chromiumData) => {
  const actVersions = []  
  for (let osItem of data) {
    if (osItem.os === 'win64') {
      for (let ch of osItem.versions) {
        if (['canary', 'stable', 'dev', 'beta'].includes(ch.channel)) {
          actVersions.push({channel: ch.channel, current: ch.current_version})
        }
      }
    }
  } 
  let curChromium = {channel: 'chromium', current: chromiumData}  
  actVersions.push(curChromium)
  console.log({actVersions})

  const {version: ourVersion} = detect()
  // console.log(name, ourVersion)
  const [ourMajor, ourMinor, ourBuild, ourPatch] = ourVersion.split('.').map(a => parseInt(a))
  console.log('Detected in the browser:', ourVersion, ourMajor, ourMinor, ourBuild, ourPatch)
  
  const setDisplay = (name, dispname, major, fullVersion, actFull) => {
    const tooltip = `${dispname} ${fullVersion}\nLatest version: ${actFull.current}`
    chrome.browserAction.setIcon({ path: `icons/${name}_cr.png` })
    const tooltipBg = actFull.current === fullVersion ? '#6ae' : '#CC3333'
    chrome.browserAction.setBadgeBackgroundColor({color: tooltipBg})
    chrome.browserAction.setBadgeText({ text: major.toString() })
    chrome.browserAction.setTitle({ title: tooltip })
  }
  
  let foundVersion
  
  if (isChromium()) {
    foundVersion = curChromium
    setDisplay('chromium', 'Chromium', ourMajor, ourVersion, curChromium)
  } else {
    for (let actVer of actVersions) {
      actVer.current === ourVersion && (foundVersion = actVer)
    }
    console.log('1st round: found identical version: ', foundVersion || 'not found')
    if (!foundVersion) {
      let minProx = 333
      for (let actVer of actVersions) {
        const [actMajor, actMinor, actBuild, actPatch] = actVer.current.split('.').map(a => parseInt(a))
        if (actMajor === ourMajor && actMinor === ourMinor) {
          if (actBuild < ourBuild || (actBuild === ourBuild && actPatch < ourPatch)) {
            console.log('Build/Patch mismatch:', {actBuild, ourBuild, actPatch, ourPatch})
            break
          }
          const thisProx = actBuild - ourBuild + actPatch - ourPatch
          console.log(`Proximity for ${actVer.channel} is ${thisProx}`)
          if (thisProx < minProx) {
            minProx = thisProx
            foundVersion = actVer
          }
        }        
      } 
      console.log('2nd round: found similar (Major/Minor are the same) version: ', foundVersion || 'not found')     
    }
    foundVersion || (foundVersion = {channel: 'unknown', current: ourVersion})
    const names = {
      stable: {show: 'Chrome', icon: 'chrome'},
      canary: {show: 'Chrome Canary', icon: 'canary'},
      chromium: {show: 'Chromium', icon: 'chromium'},
      dev: {show: 'Chrome Dev', icon: 'chromedev'}, 
      beta: {show: 'Chrome Beta', icon: 'chromedev'},
      unknown: {show: 'Unknown browser', icon: 'nochrome'}
    }[foundVersion.channel]
    console.log(`Strings selected for channel <${foundVersion.channel}>:`, names)
    setDisplay(names.icon, names.show, ourMajor, ourVersion, foundVersion)
  }
  
  //chrome.browserAction.setPopup({ popup: 'popup.html' })
  chrome.browserAction.onClicked.addListener(() => {    
    chrome.browserAction.openPopup()
  })  
}
