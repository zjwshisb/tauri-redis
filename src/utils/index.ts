import {
  WebviewWindow,
  getCurrent,
  type WindowLabel,
  type WindowOptions
} from '@tauri-apps/api/window'

export function versionCompare(v1: string, v2: string) {
  const sources = v1.split('.')
  const target = v2.split('.')
  const maxL = Math.max(sources.length, target.length)
  let result = 0
  for (let i = 0; i < maxL; i++) {
    const preValue = sources.length > i ? sources[i] : '0'
    const preNum = parseInt(preValue)
    const lastValue = target.length > i ? target[i] : '0'
    const lastNum = parseInt(lastValue)
    if (preNum < lastNum) {
      result = -1
      break
    } else if (preNum > lastNum) {
      result = 1
      break
    }
  }
  return result
}

export async function openWindow(
  label: WindowLabel,
  options: WindowOptions
): Promise<WebviewWindow> {
  return await new Promise((resolve, reject) => {
    if (options.titleBarStyle === undefined) {
      options.titleBarStyle = 'transparent'
    }
    if (options.width === undefined) {
      options.width = 1000
    }
    if (options.height === undefined) {
      options.height = 800
    }
    options.tabbingIdentifier = 'test'
    const webview = new WebviewWindow(label, options)
    webview.once('tauri://created', function () {
      resolve(webview)
    })
    webview.once('tauri://error', function (e) {
      webview.setFocus()
      reject(webview)
    })
  })
}

export function memoryFormat(memory: number) {
  if (memory <= 1024) {
    return `${memory}B`
  }
  if (memory <= 1024 * 1024) {
    return (memory / 1024).toFixed(1) + 'KB'
  }
  return (memory / 1024 / 1024).toFixed(1) + 'MB'
}

export function isMainWindow() {
  const window = getCurrent()
  return window.label === 'main'
}
