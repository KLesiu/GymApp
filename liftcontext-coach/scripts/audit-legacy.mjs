import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const roots = ['src', 'public', 'tests', 'package.json']
const forbidden = ['lgym', 'signalr', 'firebase', 'cloudinary', 'cloud2ware', 'google-signin', 'google.client']
const pattern = new RegExp(forbidden.map((item) => item.replace('.', '\\.')).join('|'), 'i')
const matches = []

const walk = (path) => {
  const stat = statSync(path)
  if (path.includes('audit-legacy.mjs')) return
  if (stat.isDirectory()) {
    for (const entry of readdirSync(path)) walk(join(path, entry))
    return
  }
  const text = readFileSync(path, 'utf8')
  text.split(/\r?\n/).forEach((line, index) => {
    if (pattern.test(line)) matches.push(`${path}:${index + 1}: ${line}`)
  })
}

for (const root of roots) walk(root)
if (matches.length > 0) {
  console.error(matches.join('\n'))
  process.exit(1)
}
console.log('Legacy integration audit passed with zero production artifact matches.')
