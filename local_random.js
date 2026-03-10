export function getChar() {
    const length = Math.floor(Math.random() * 4) + 8 // 8~11位
    let charset = 'abcdefghijklmnopqrstuvwxyz'

    let result = ''
    for (let i = 0; i < length; i++) {
        result += charset[Math.floor(Math.random() * charset.length)]
    }
    return result
}
export function getRandomBoolStr() {
    return Math.random() > 0.5 ? 'true' : 'false'
}
export function getRandomBool() {
    return Math.random() > 0.5
}
export function getDelimiter(){
    return getRandomBool() ? "\"" : "";
}

export function getDelimiterStr(size = 1){
    let str = ""
    for (let i = 0; i < size; i++) {
        str += `${getDelimiter() + getChar() + getDelimiter()} `
        if (getRandomBool()){
            str += getRanLabel()
        }
    }
    return str
}

let strs = ["\n","</<br>","\"","'","`","{","}","[","]","&","|", "<html>", "<head>", "<body>", "<div>", "<span>", "<header>", "<footer>",
    "<main>", "<section>", "<article>", "<aside>", "<nav>",
    "<h1>", "<h2>", "<h3>", "<h4>", "<h5>", "<h6>",
    "<p>", "<a>", "<ul>", "<ol>", "<li>", "<dl>", "<dt>", "<dd>",
    "<table>", "<thead>", "<tbody>", "<tfoot>", "<tr>", "<td>", "<th>", "<caption>",
    "<form>", "<input>", "<textarea>", "<button>", "<select>", "<option>", "<label>",
    "<img>", "<audio>", "<video>", "<source>", "<iframe>", "<canvas>", "<script>", "<style>",
    "<blockquote>", "<code>", "<pre>", "<br>", "<hr>", "<b>", "<i>", "<u>", "<strong>", "<em>",
    "<mark>", "<small>", "<sub>", "<sup>", "<abbr>", "<meta>", "<link>", "<title>", "</html>", "</head>", "</body>", "</div>", "</span>", "</header>", "</footer>",
    "</main>", "</section>", "</article>", "</aside>", "</nav>",
    "</h1>", "</h2>", "</h3>", "</h4>", "</h5>", "</h6>",
    "</p>", "</a>", "</ul>", "</ol>", "</li>", "</dl>", "</dt>", "</dd>",
    "</table>", "</thead>", "</tbody>", "</tfoot>", "</tr>", "</td>", "</th>", "</caption>",
    "</form>", "</textarea>", "</button>", "</select>", "</option>", "</label>",
    "</audio>", "</video>", "</iframe>", "</canvas>", "</script>", "</style>",
    "</blockquote>", "</code>", "</pre>", "</b>", "</i>", "</u>", "</strong>", "</em>",
    "</mark>", "</small>", "</sub>", "</sup>", "</abbr>", "</title>"]
export function getRanLabel(){
    return  strs[Math.floor(Math.random() * strs.length)]
}

export const htmlTags = [
    "media", "text", "span", "strong", "meta", "body", "font", "box", "transform",
    "wrap", "space", "break", "nil", "void", "null", "fake", "empty", "attr", "hidden", "context", "content"
]

export function getAllSharding(){
    return htmlTags.map(item => `
        customElements.define(\`op-${item}\`, class extends HTMLElement {
            constructor() {
              super();
              this.attachShadow({ mode: 'closed' });
            }
        });
    `).join("")
}

function capitalizeFirstLetter(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}