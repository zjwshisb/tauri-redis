import { makeAutoObservable, runInAction } from 'mobx'
import type React from 'react'
import spark from 'spark-md5'
import { openWindow } from '@/utils'

export type Page =
  | MonitorPage
  | InfoPage
  | KeyPage
  | ClientPage
  | PubsubPage
  | NodePage
  | SlowLogPage
  | ConfigPage
  | MemoryAnalysisPage

interface BasePage {
  label: React.ReactNode
  key: string
  children: React.ReactNode
  connection: APP.Connection
}

type PubsubPage = BasePage & {
  type: 'pubsub'
}
type ClientPage = BasePage & {
  type: 'client'
}
type NodePage = BasePage & {
  type: 'node'
}

type MonitorPage = BasePage & {
  type: 'monitor'
}
type InfoPage = BasePage & {
  type: 'info'
}
type KeyPage = BasePage & {
  type: 'key'
  name: string
  db: number
}
type SlowLogPage = BasePage & {
  type: 'slow-log'
}
type ConfigPage = BasePage & {
  type: 'config'
}
type MemoryAnalysisPage = BasePage & {
  type: 'memory-analysis'
}

class PageStore {
  pages: Page[] = []
  active: string = ''
  constructor() {
    makeAutoObservable(this)
  }

  switch(active: string) {
    this.active = active
  }

  removeOtherPage(index: number) {
    if (index < this.pages.length) {
      this.pages = [this.pages[index]]
    }
  }

  removeAllPage() {
    this.pages = []
    this.active = ''
  }

  removeLeftPage(index: number) {
    this.pages = this.pages.slice(index)
  }

  removeRightPage(index: number) {
    this.pages.splice(index + 1)
    this.pages = [...this.pages]
  }

  removePage(key: string) {
    const index = this.pages.findIndex((v) => v.key === key)
    if (index > -1) {
      this.pages.splice(index, 1)
      this.pages = [...this.pages]
      if (key === this.active) {
        if (this.pages.length >= index + 1) {
          this.active = this.pages[index].key
        } else if (this.pages.length > 0) {
          this.active = this.pages[this.pages.length - 1].key
        }
      }
      console.log(this.active)
    }
  }

  setPage(pages: Page[]) {
    this.pages = pages
  }

  async openNewWindowPageKey(key: string) {
    const page = this.pages.find((v) => v.key === key)
    if (page != null) {
      await this.openNewWindowPage(page)
      runInAction(() => {
        this.removePage(key)
      })
    }
    return await Promise.reject(new Error('Page Not Found'))
  }

  async openNewWindowPage(p: Page) {
    let url = `/src/windows/detail/index.html?type=${p.type}&cid=${
      p.connection.id
    }&key=${encodeURI(p.key)}`
    switch (p.type) {
      case 'key': {
        url += `&db=${p.db}&name=${encodeURI(p.name)}`
        break
      }
      case 'monitor': {
        break
      }
      case 'pubsub': {
        break
      }
      case 'memory-analysis': {
        break
      }
      case 'info': {
        break
      }
      case 'client': {
        break
      }
      case 'node': {
        break
      }
      case 'slow-log': {
        break
      }
      case 'config': {
        break
      }
      default: {
        url = ''
        break
      }
    }
    if (url !== '') {
      const label = `${p.connection.id}-${spark.hash(p.key)}`
      await openWindow(label, {
        url,
        title: p.key,
        focus: true
      })
    } else {
      return await Promise.reject(new Error('invalid page'))
    }
  }

  updatePage(key: string, page: Page) {
    const index = this.pages.findIndex((v) => v.key === key)
    if (index > -1) {
      this.pages[index] = page
      this.pages = [...this.pages]
      if (this.active === key) {
        this.active = page.key
      }
    }
  }

  addPage(page: Page) {
    const exist = this.pages.find((v) => v.key === page.key)
    if (exist != null) {
      this.active = exist.key
    } else {
      this.pages.push(page)
      this.active = page.key
      this.pages = [...this.pages]
    }
  }
}
export default PageStore
