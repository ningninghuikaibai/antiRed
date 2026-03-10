import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import CryptoJS from 'crypto-js'
import {getChar, getRandomBool, getRandomBoolStr, htmlTags} from "./local_random.js";
// ✅ 模拟 __filename 和 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ✅ 构建文件路径
const charDictPath = path.resolve(__dirname, 'words_alpha.txt')

// ✅ 读取并处理文件内容
const charLines = fs.existsSync(charDictPath)
    ? fs.readFileSync(charDictPath, 'utf-8').split(/\r?\n/).filter(Boolean)
    : []
// 获取随机字符

export function getWord() {
    if (charLines.length === 0) return 'word'
    let str = ""
    while (str.length < 5 || str.length > 13){
        str = charLines[Math.floor(Math.random() * charLines.length)]
    }
    return str.trim()
}


export function getCharOrString(){
    if (getRandomBool()){
        return getChar()
    }
    return getWord()
}

export function getChatLength(fun){
    let random = Math.random() * 3 + 1
    let chars = []
    for (let i = 0; i < random; i++) {
        chars.push(fun())
    }
    return chars.join("-");
}



export function getRandomTagName() {
    const choice = htmlTags[Math.floor(Math.random() * htmlTags.length)]
    return `op-${choice}`
    // return `op-text`
}

const htmlContents = [
    "content", "substance", "material", "information", "subject", "theme", "essence"
]

export function getRandomAttrName() {
    const choice = htmlContents[Math.floor(Math.random() * htmlContents.length)]
    return `data-op-${choice}`
}


const base64Key = 'mPrfVPd+d+P1v9PFFqYUP/vuQ7OIv0uqFmr4sDjQzTk='
const base64Iv = 'N0kZcEluf2k4xWJ3YFvYpg=='

// 解码为 CryptoJS WordArray
const key = CryptoJS.enc.Base64.parse(base64Key)
const iv = CryptoJS.enc.Base64.parse(base64Iv)

/**
 * AES-256-CBC 加密（返回 base64 编码的密文）
 * @param {string} plaintext - 要加密的字符串
 * @returns {string} base64 加密结果
 */
export function encryptAES256CBC(plaintext) {
    const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    })

    return encrypted.toString()
}


