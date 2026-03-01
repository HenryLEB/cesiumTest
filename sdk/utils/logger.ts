// 日志工具
const DEBUG = import.meta.env.DEV

export const logger = {
  log: (...args: any[]) => {
    if (DEBUG) console.log(...args)
  },
  
  warn: (...args: any[]) => {
    if (DEBUG) console.warn(...args)
  },
  
  error: (...args: any[]) => {
    console.error(...args)
  },
  
  info: (...args: any[]) => {
    if (DEBUG) console.info(...args)
  }
}
