import type { SDKEventType, EventHandler } from '../types'

/**
 * 事件发射器
 * 提供事件监听和触发功能
 */
export class EventEmitter {
  private events: Map<SDKEventType, EventHandler[]> = new Map()

  /**
   * 监听事件
   */
  on(event: SDKEventType, handler: EventHandler): void {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(handler)
  }

  /**
   * 监听一次事件
   */
  once(event: SDKEventType, handler: EventHandler): void {
    const onceHandler: EventHandler = (...args) => {
      handler(...args)
      this.off(event, onceHandler)
    }
    this.on(event, onceHandler)
  }

  /**
   * 移除事件监听
   */
  off(event: SDKEventType, handler: EventHandler): void {
    const handlers = this.events.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  /**
   * 触发事件
   */
  emit(event: SDKEventType, ...args: any[]): void {
    const handlers = this.events.get(event)
    if (handlers) {
      handlers.forEach(handler => handler(...args))
    }
  }

  /**
   * 移除所有事件监听
   */
  removeAllListeners(event?: SDKEventType): void {
    if (event) {
      this.events.delete(event)
    } else {
      this.events.clear()
    }
  }
}
