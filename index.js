import { parse as parseSFC } from '@vue/compiler-sfc'
import {getWord, getCharOrString, getChatLength,getRandomTagName,getRandomAttrName,encryptAES256CBC} from "./random.js"
import {getAllSharding, getChar, getRandomBoolStr} from "./local_random.js"
function modifyAttrsPlugin() {
    return {
        name: 'vite:modify-attrs',
        enforce: 'pre',
        transform(code, id) {
            if (!id.endsWith('.vue')) {
                return null
            }

            const { descriptor } = parseSFC(code, { filename: id })
            if (!descriptor.template) {
                return null
            }
            // 将原本的内容修改成为data-t
            let template = modifyInnerText(descriptor.template.content)

            // 添加属性
             template = injectAttrsToHtml(template)

            // 修改data-t
            template = transformHtmlTags(template)
            let finalCode = `<template>\n${template}\n</template>\n`
            if (descriptor.script) {
                finalCode += `<script${descriptor.script.attrs.lang ? ` lang="${descriptor.script.attrs.lang}"` : ''}>\n${descriptor.script.content}\n</script>\n`
            }
            if (descriptor.scriptSetup) {
                finalCode += `<script setup${descriptor.scriptSetup.attrs.lang ? ` lang="${descriptor.scriptSetup.attrs.lang}"` : ''}>\n${descriptor.scriptSetup.content}\n</script>\n`
            }
            for (const style of descriptor.styles) {
                finalCode += `<style${style.attrs.lang ? ` lang="${style.attrs.lang}"` : ''}${style.scoped ? ' scoped' : ''}>\n${style.content}\n</style>\n`
            }

            return {
                code: finalCode,
                map: null,
            }
        }, transformIndexHtml: {
            enforce: 'pre',
            transform(html) {
                return {
                    html,
                    tags: [
                        {
                            tag: 'meta',
                            attrs: {
                                name: 'robots',
                                content: 'noindex,nofollow,noarchive,nosnippet'
                            },
                            injectTo: 'head'
                        },
                        {
                            tag: 'meta',
                            attrs: {
                                name: 'googlebot',
                                content: 'noindex,nofollow,noimageindex'
                            },
                            injectTo: 'head'
                        },
                        {
                            tag: 'meta',
                            attrs: {
                                name: 'referrer',
                                content: 'no-referrer'
                            },
                            injectTo: 'head'
                        },
                        {
                            tag: 'meta',
                            attrs: {
                                'http-equiv': 'X-Content-Type-Options',
                                content: 'nosniff'
                            },
                            injectTo: 'head'
                        },{
                            tag: 'script',
                            injectTo: 'head',
                            children: getAllSharding()
                        }
                    ]
                }
            }
        }
    }
}
export function injectAttrsToHtml(template) {
    const tagRe = /<([a-zA-Z][a-zA-Z0-9\-]*)(\s[^<>]*?)?(\s*\/?)>/g
    const attrRe = /([:@]?[\w\-:]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'>=]+))?/g

    const skipTags = new Set(['slot', 'input', 'template', 'a','body','html'])

    return template.replace(tagRe, (full, tagName, attrs = '', selfClose) => {
        const lowerTag = tagName.toLowerCase()
        if (skipTags.has(lowerTag)) return full

        const existing = new Set()
        let dataCount = 0
        const attrsObj = {}
        const quoteMap = {}

        // 记录属性值及其引号
        attrs.replace(attrRe, (match, key, val) => {
            existing.add(key)
            if (key.startsWith('data')) dataCount++
            if (val) {
                const raw = val.trim()
                const unquoted = raw.replace(/^['"]|['"]$/g, '')
                attrsObj[key] = unquoted

                if (raw.startsWith('"')) quoteMap[key] = '"'
                else if (raw.startsWith("'")) quoteMap[key] = "'"
                else quoteMap[key] = '"'
            } else {
                attrsObj[key] = ''
            }
            return ''
        })

        if (dataCount > 5) return full

        function addAttr(k, v = '') {
            if (!existing.has(k)) {
                attrsObj[k] = v
                quoteMap[k] = '"' // 默认新增使用双引号
            }
        }

        addAttr(getChar(), getWord())
        addAttr('data-' + getCharOrString() + '-' + getWord(), getWord())
        addAttr('data-' + getChatLength(getCharOrString), getChar())
        // addAttr("v-html",getCharOrString())
        const title = getCharOrString()
        addAttr('aria-label', title)
        addAttr('title', title)
        addAttr('aria-hidden', getRandomBoolStr())

        for (let i = 0; i < 4; i++) {
            const randFuncs = [
                () => addAttr('data-p-' + getWord() + '-' + getCharOrString(), getWord()),
                () => addAttr('data-x-' + getWord() + '-' + getCharOrString(), ''),
                () => addAttr('data-l-' + getWord() + '-' + getCharOrString(), ''),
                () => addAttr(getCharOrString() + '-' + getWord(), ''),
                () => addAttr('data-n-' + getWord(), ''),
                () => addAttr('data-' + getChar(), getWord()),
                () => addAttr('data-o-' + getChatLength(getCharOrString), getChar()),
            ]
            randFuncs[Math.floor(Math.random() * randFuncs.length)]()
        }

        const newAttrs = Object.entries(attrsObj)
            .map(([k, v]) => {
                if (v === '') return k
                const quote = quoteMap[k] || '"'
                return `${k}=${quote}${v}${quote}`
            })
            .join(' ')

        return `<${tagName}${newAttrs ? ' ' + newAttrs : ''}${selfClose}>`
    })
}


 function transformHtmlTags(html) {
    const tagRe = /<\/?([a-zA-Z][\w-]*)(\s[^<>]*?)?(\s*\/?)>/g
    const attrRe = /([:@]?[\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g

    const targetTags = new Set(['span', 'div', 'e-span', 'e-strong'])

    const stack = []
    let result = ''
    let lastIndex = 0

    html.replace(tagRe, (match, tagName, attrStr = '', selfClose = '', offset) => {
        const isClosing = match.startsWith('</')
        const lowerTag = tagName.toLowerCase()

        result += html.slice(lastIndex, offset)
        lastIndex = offset + match.length

        if (!isClosing) {
            if (targetTags.has(lowerTag) && attrStr.includes('data-t=')) {
                const newTag = getRandomTagName()
                const newAttrName = getRandomAttrName()
                const newAttrs = []

                for (const m of attrStr.matchAll(attrRe)) {
                    const key = m[1]
                    const val = m[2] || m[3] || m[4] || ''

                    if (key === 'data-t') {
                        const enc = encryptAES256CBC(val)

                        // 保持原始引号类型
                        let quote = '"'
                        if (m[2] !== undefined) quote = '"'
                        else if (m[3] !== undefined) quote = "'"

                        newAttrs.push(`${newAttrName}=${quote}${enc}${quote}`)
                        newAttrs.push('data-op-encrypted')
                    } else {
                        if (val) {
                            let quote = '"'
                            if (m[2] !== undefined) quote = '"'
                            else if (m[3] !== undefined) quote = "'"
                            newAttrs.push(`${key}=${quote}${val}${quote}`)
                        } else {
                            newAttrs.push(key)
                        }
                    }
                }

                stack.push({ old: tagName, new: newTag })
                result += `<${newTag} ${newAttrs.join(' ')}${selfClose}>`
            } else {
                result += match
            }
        } else {
            if (stack.length > 0 && stack[stack.length - 1].old === tagName) {
                const newTag = stack.pop().new
                result += `</${newTag}>`
            } else {
                result += match
            }
        }

        return match
    })

    result += html.slice(lastIndex)
    return result
}

function wrapTextWithESpanByRegex(htmlStr) {
    // 正则匹配标签和文本，捕获文本部分
    return htmlStr
}

function modifier(str){
    const parts = str.split(/({{.*?}})/);
    return parts.map(part => {
        if (/^{{.*}}$/.test(part)) {
            return part; // 保留原样
        }
        return splitWordsAttachSpaces(part).map(item => `<e-span data-t="${item}"></e-span>`).join('');
    }).join('');
}

function splitWordsAttachSpaces(str) {
    const result = [];
    const regex = /[^\s]+(?:\s*)/g; // 匹配非空白 + 后面跟的空格
    let match;

    while ((match = regex.exec(str)) !== null) {
        result.push(match[0]);
    }

    return result;
}
// 往里面添加一段js代码
function modifyInnerText(html) {
    return html.replace(/>([^<>]+)</g, (match, text) => {
        const newText = modifier(text.trim());
        return `>${newText}<`;
    });
}
// 解密函数
export {modifyAttrsPlugin}


