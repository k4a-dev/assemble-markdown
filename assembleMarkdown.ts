type Post = {
  id: string
  content: string
  title: string
  createdate: string
  updatedate: string
  sumbnail: string
  tags: { [key: string]: string }[]
}

type MarkdownObject = {
  i: number
  tag:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'br'
    | 'none'
    | 'img'
    | 'video'
    | 'link'
    | 'code'
    | 'ad'
    | 'affiliate'
  text: string
  expand: boolean
  childExpand: boolean
  child: MarkdownObject[]
  src?: string
  url?: string
  language?: string
}

const markdownReg = {
  h1: /^#\s(.*)/,
  h2: /^##\s(.*)/,
  h3: /^###\s(.*)/,
  h4: /^####\s(.*)/,
  h5: /^#####\s(.*)/,
  br: /^(\.{2,})$/,
  // strong: /(.*)\*{2,}(.*)\*{2,}(.*)/,
  ul: /^\s*-\s(.*)/,
  ol: /^1\.\s(.*)/,
  li: /^(:?\s*-\s|1\.\s)(.*)/,
  img: /^!\[(.*)\]\((.*)\)/,
  video: /^!\[(.*)\]\((.*\.mp4)\)/,
  div: /^(?!.*<\/div>).*(<div.*).*$/,
  span: /^(?!.*<\/span>).*(<span.*).*$/,
  code: /^```(.*)/,
  ad: '<ad(|/)>',
  table: /^\|(.*)\|/,
  link: /.*\[(.*)\]\((.*)\).*/,
  blockquote: /^>(.*)/,
  affiliate: /<(:?|\/)affiliate>/,
  chat: /^<chat(:?1|2).*/,
  chats: /^<chats(:?1|2).*/,
}

// import md from 'markdown-it'

const md = require('markdown-it')({
  injected: true, // $mdを利用してmarkdownをhtmlにレンダリングする
  breaks: true, // 改行コードに変換する
  html: true, // HTML タグを有効にする
  linkify: true, // URLに似たテキストをリンクに自動変換する
  typography: true, // 言語に依存しないきれいな 置換 + 引用符 を有効にします。
  langPrefix: 'hljs ',
})

// 内部テキストの単純変換
const replaceInMarkdown = (text: string) => {
  return text
    .replace(
      /コーヒーブレイク：/g,
      '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="coffee" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="svg-inline--fa fa-coffee fa-w-20"><path fill="currentColor" d="M192 384h192c53 0 96-43 96-96h32c70.6 0 128-57.4 128-128S582.6 32 512 32H120c-13.3 0-24 10.7-24 24v232c0 53 43 96 96 96zM512 96c35.3 0 64 28.7 64 64s-28.7 64-64 64h-32V96h32zm47.7 384H48.3c-47.6 0-61-64-36-64h583.3c25 0 11.8 64-35.9 64z" class=""></path></svg>'
    )
    .replace(/<a(.*)>(.*)<\/a>/g, '<a $1 target="_blank" >$2</a>')
}

// markdownからデータ構造へ
const assemblyMarkdownToStructure = (
  lines: string[],
  i: number,
  hie: number
): { obj: MarkdownObject | null; i: number; hie: number } => {
  let dataObject: any = []
  let line = lines[i]

  if (i >= lines.length) {
    return {
      obj: null,
      i,
      hie: hie - 1,
    }
  }

  // 今の行がヘッダに該当する場合
  if (
    line.match(markdownReg.h1) ||
    line.match(markdownReg.h2) ||
    line.match(markdownReg.h3) ||
    line.match(markdownReg.h4)
  ) {
    return assemblyMarkdownToHeaderStructure(lines, i, hie)
  }

  if (line.match(markdownReg.div) || line.match(markdownReg.span)) {
    line += '\n'
    for (
      let iDiv = i + 1;
      iDiv < lines.length && !lines[iDiv].match(/<\/div>/) && !lines[iDiv].match(/<\/span>/);
      iDiv++
    ) {
      line += lines[iDiv] + '\n'
      i = iDiv
    }

    dataObject = { tag: 'none', text: md.render(line) }
  } else if (line.match(markdownReg.br)) {
    // 改行要素
    const spacenum = RegExp.$1.length
    dataObject = {
      tag: 'none',
      text: '<br/>'.repeat(Math.round(spacenum / 2)),
    }
  } else if (line.match(markdownReg.video)) {
    // 動画要素
    dataObject = { tag: 'video', src: RegExp.$2, alt: RegExp.$1 }
  } else if (line.match(markdownReg.img)) {
    // イメージ要素
    dataObject = { tag: 'img', src: RegExp.$2, alt: RegExp.$1 }
  } else if (line.match(markdownReg.code)) {
    // コード要素
    let text = ''
    const language = RegExp.$1
    do {
      if (!lines[i].match(markdownReg.code)) {
        if (lines[i] === '') {
          text += `\n`
        } else {
          text += lines[i] + `\n`
        }
      }
      i++
    } while (i < lines.length - 1 && !lines[i].match(/^```$/))
    dataObject = { tag: 'code', language, text }
  } else if (line.match(markdownReg.ad)) {
    // 広告要素
    // h3と同じヒエラルキーに強制表示(最初はh2にしていたが、折りたたみ時に見えちゃうのが許せない)
    if (hie > 2) {
      hie = 2
      i = i - 1
    } else {
      dataObject = {
        tag: 'ad',
        text: 'google',
        expand: true,
        childExpand: true,
      }
    }
  } else if (line.match(markdownReg.affiliate)) {
    // アフィリエイト要素
    type Tag = 'img' | 'amazon' | 'rakuten' | 'yahoo' | 'title'
    const tags: Array<Tag> = ['img', 'amazon', 'rakuten', 'yahoo', 'title']
    const links: { [key: string]: string } = {}
    for (i = i + 1; i < lines.length && !lines[i].match(markdownReg.affiliate); i++) {
      tags.forEach((tag) => {
        const reg = new RegExp('^' + tag + ':(.*)')
        if (lines[i].match(reg)) {
          links[tag] = RegExp.$1
        }
      })
    }
    dataObject = { tag: 'affiliate', links }
  } else if (
    line.match(markdownReg.table) ||
    line.match(markdownReg.blockquote) ||
    line.match(markdownReg.li)
  ) {
    // テーブル要素
    // 引用要素
    // リスト要素

    const regs = [markdownReg.table, markdownReg.blockquote, markdownReg.li]
    regs.forEach((reg) => {
      if (line.match(reg)) {
        const blockObject = renderContinuousBlock(lines, i, reg, '', '', /!./)
        i = blockObject.i
        dataObject = { tag: 'none', text: blockObject.block }
      }
    })
  } else if (line.match(markdownReg.chat)) {
    const reg = markdownReg.chat
    if (line.match(reg)) {
      const blockObject = renderContinuousBlock(
        lines,
        i,
        reg,
        '<chatParent' + RegExp.$1 + '><chat' + RegExp.$1 + '>',
        '</chat' + RegExp.$1 + '></chatParent' + RegExp.$1 + '>',
        /^<chat(:?1|2)>/
      )
      i = blockObject.i
      dataObject = { tag: 'none', text: blockObject.block }
    }
  } else {
    // その他markdown要素 - 強調 -
    // ただのテキスト
    dataObject = {
      tag: 'none',
      text: replaceInMarkdown(md.render(line)),
    }
  }

  return { obj: dataObject, i, hie }
}

const renderContinuousBlock = function (
  lines: string[],
  i: number,
  reg: RegExp,
  prefix: string,
  suffix: string,
  removeReg: RegExp
) {
  const removeDesignatedText = (text: string) => {
    return text.replace(removeReg, '')
  }
  let block = prefix + removeDesignatedText(lines[i]) + '\n'
  for (let iBlock = i + 1; iBlock < lines.length && lines[iBlock].match(reg); iBlock++) {
    const pureText = removeDesignatedText(lines[iBlock])
    let addText = pureText
    if (pureText === '') addText = '&nbsp;'
    // block += '<span>' + addText + '\n' + '</span>'
    block += addText + '\n'
    i = iBlock
  }
  return { block: md.render(block) + suffix, i }
}
/** ***************** markdownからヘッダーへ ********************/
const assemblyMarkdownToHeaderStructure = (
  lines: string[],
  i: number,
  hie: number
): { i: number; hie: number; obj: null | MarkdownObject } => {
  const line = lines[i]
  const header: Array<'h1' | 'h2' | 'h3' | 'h4' | 'h5'> = ['h1', 'h2', 'h3', 'h4', 'h5']
  /* ヘッダ階層：小さい← h1 : 0 h2 : 1 h3 : 2  →大きい */
  for (let headerHierarchie = 0; headerHierarchie < header.length; headerHierarchie++) {
    const headerTag = header[headerHierarchie]
    if (line.match(markdownReg[headerTag])) {
      const text = RegExp.$1

      if (headerHierarchie <= hie) {
        // 今の階層と同じ、もしくはそれより小さいものが来た場合、今持っているオブジェクトは返して、小さい階層に再度判定させる
        return { i: i - 1, hie: hie - 1, obj: null }
      } else {
        const child = []
        let childHierarchie = headerHierarchie

        // 今の階層より大きいのものが来た場合 次の行を子として保持する
        do {
          const childObj = assemblyMarkdownToStructure(lines, i + 1, childHierarchie)
          // 帰ってきたオブジェクトがからじゃなかったら子に追加する

          if (childObj.obj && Object.keys(childObj.obj).length !== 0) {
            if (childObj.obj.text == '' && !child.length) null
            else child.push(childObj.obj)
          }
          childHierarchie = childObj.hie
          hie = childObj.hie
          i = childObj.i

          // 子の階層がまだ大きかったら、再度子の保持を繰り返す
        } while (headerHierarchie <= childHierarchie)

        if (child.length && child[child.length - 1].text == '') {
          child.pop()
        }

        return {
          i,
          hie,
          obj: {
            i,
            tag: headerTag,
            text: replaceInMarkdown(md.render(text)),
            expand: true,
            childExpand: true,
            child,
          },
        }
      }
    }
  }
  //TODO
  return { i, hie, obj: null }
}

const assemblyMarkdown = (markdown: string): MarkdownObject[] => {
  const lines = markdown.split(/\n/)
  const obj = []
  for (let i = 0; i < lines.length; i++) {
    // ここではない
    const assembliedObject = assemblyMarkdownToStructure(lines, i, -1)
    const assignObj = assembliedObject.obj

    if (!assignObj) continue

    if ('tag' in assignObj) {
      obj.push(assignObj)
      i = assembliedObject.i
    }
  }

  if (obj.length && obj[0].text == '') {
    obj.shift()
  }

  return obj
}

/** ***************** markdownからリスト(html)へ ********************/
// assemblyMarkdownToHtmlList(lines, listObject, num, hierarchy, type) {
//   listObject += $md.render(
//     lines[num].replace(markdownReg[type], '<li>') +
//       $md.render(lines[num].replace(markdownReg[type], '$1\n')) +
//       '</li>'
//   )
//   let next = num
//   const nextline = lines[num + 1]

//   if (nextline.match(markdownReg[type])) {
//     const NextHierarchy = nextline.match(/\s*/)[0].length

//     if (NextHierarchy > hierarchy) {
//       listObject += '<' + type + '>'
//     } else if (NextHierarchy < hierarchy) {
//       listObject += '</' + type + '>'
//     }
//     const assembliedObject = assemblyMarkdownToHtmlList(
//       lines,
//       listObject,
//       num + 1,
//       NextHierarchy,
//       type
//     )
//     next = assembliedObject.next
//     listObject = assembliedObject.listObject
//   }
//   return { next, listObject }
// }

export default assemblyMarkdown
