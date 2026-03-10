import CryptoJS from 'crypto-js'
import {getChar, getDelimiter, getDelimiterStr, getRandomBool, getRandomBoolStr} from "./local_random.js";

// Base64 编码的 key 和 iv
const base64Key = 'mPrfVPd+d+P1v9PFFqYUP/vuQ7OIv0uqFmr4sDjQzTk='
const base64Iv = 'N0kZcEluf2k4xWJ3YFvYpg=='

// 解码为 CryptoJS WordArray
const key = CryptoJS.enc.Base64.parse(base64Key)
const iv = CryptoJS.enc.Base64.parse(base64Iv)


function stopContent(){
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
    return false;
}
let isStop = true;



/**
 * AES-256-CBC 解密（传入 base64 编码密文）
 * @param {string} ciphertext - base64 编码密文
 * @returns {string} 解密后的字符串
 */
export function decryptAES256CBC(ciphertext) {
    const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    })

    return decrypted.toString(CryptoJS.enc.Utf8)
}

function tryDecryptAES(base64CipherText) {
    return decryptAES256CBC(base64CipherText)
    
}

const VALID_NOT_KEYS = ["content", "substance", "material", "information", "subject", "theme", "essence"]


/**
 * @param {HTMLElement} rootNode - 顶节点，函数将在它所有子孙节点里查找目标属性解密覆盖
 */
function decryptAllUnder(rootNode) {
    if (!rootNode || !(rootNode instanceof HTMLElement)) {
        rootNode = document.body
    }
    if (isStop){
        isStop = stopContent()
    }
    // 查找所有有 data-op-encrypted 的节点（包含顶节点自己）
    const targets = rootNode.querySelectorAll('[data-op-encrypted]')
    // 也检查顶节点自己是否符合
    if (rootNode.hasAttribute && rootNode.hasAttribute('data-op-encrypted')) {
        decryptNode(rootNode)
    }
    targets.forEach(el => decryptNode(el))

    function decryptNode(el) {
        const mainCipher = el.hasAttribute('data-op-encrypted')
        if (!mainCipher) return
        VALID_NOT_KEYS.forEach(key => {
            const attr = `data-op-${key}`
            if (el.hasAttribute(attr)) {
                try {
                    const encValue = el.getAttribute(attr)
                    const decValue = tryDecryptAES(encValue)
                    if (decValue !== null) {
                        el.setAttribute(attr, decValue)
                    }
                }catch (e){
                    console.log('编译出错',e)
                }
                try {
                    el.setAttribute(`data-${getChar()}`,`${getDelimiterStr(2)}`)
                    el.setAttribute(v-model,`${getDelimiterStr(2)}`)
                }catch (e){
                    console.log(e)
                }
                // el.removeAttribute(attr)
            }
        })
        // 避免重复执行，移除标记
        el.removeAttribute('data-op-encrypted')
    }
}

export function observeAndDecrypt(rootNode) {
    if (!rootNode || !(rootNode instanceof HTMLElement)) {
        rootNode = document.body;
    }

    // 先对传入节点进行一次解密处理
    decryptAllUnder(rootNode);

    // 创建MutationObserver监听rootNode内部新增节点
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (!(node instanceof HTMLElement)) continue;

                // 如果新增节点本身满足条件，则解密
                if (node.hasAttribute('data-op-encrypted')) {
                    decryptAllUnder(node);
                }
                // 否则递归查找其内部满足条件的子节点
                else {
                    const targets = node.querySelectorAll('[data-op-encrypted]');
                    targets.forEach(el => decryptAllUnder(el));
                }
            }
        }
    });

    observer.observe(rootNode, {
        childList: true,
        subtree: true,
    });

    // 返回observer方便后续管理（比如停止监听）
    return observer;
}

