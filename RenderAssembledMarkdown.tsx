import React, { useEffect } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { GoogleAdsence, useAdsence } from './Adsense'
import Affiliate from './affiliateLinkCard'

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
// import { MarkdownObject } from 'types'

type Props = {
  content: MarkdownObject[]
  id: string
  sumbnail: string
  indent?: number
  documentWrapperClass?: string
  codeStyle?: any
}

const AssemblyMarkdown: React.FC<Props> = (props) => {
  return (
    <>
      {props.content.map((elem, index) => {
        return (
          <React.Fragment key={index + elem.tag + elem.text}>
            {elem.tag === 'h1' ? <h1 dangerouslySetInnerHTML={{ __html: elem.text }}></h1> : null}

            {elem.tag === 'h1' ? (
              <img src={`/assets/articles/${props.id}/${props.sumbnail}`} alt="" />
            ) : null}

            {elem.tag === 'h2' ? (
              <h2 data-first={index} dangerouslySetInnerHTML={{ __html: elem.text }}></h2>
            ) : null}
            {elem.tag === 'h3' ? (
              <h3 dangerouslySetInnerHTML={{ __html: elem.text }} data-first={index}></h3>
            ) : null}
            {elem.tag === 'h4' ? (
              <h4 dangerouslySetInnerHTML={{ __html: elem.text }} data-first={index}></h4>
            ) : null}
            {elem.tag === 'h5' ? (
              <h5 dangerouslySetInnerHTML={{ __html: elem.text }} data-first={index}></h5>
            ) : null}

            {elem.tag === 'br' ? <br></br> : ''}

            {elem.tag === 'none' ? (
              <div dangerouslySetInnerHTML={{ __html: elem.text }}></div>
            ) : null}

            {elem.tag === 'none' && elem.text == '' ? <br /> : null}

            {elem.tag === 'img' ? (
              <img src={`/assets/articles/${props.id}/${elem.src}`} alt="" />
            ) : null}

            {elem.tag === 'video' ? (
              <video
                src={`/assets/articles/${props.id}/${elem.src}`}
                muted
                loop
                autoPlay
                playsInline
              />
            ) : null}

            {elem.tag === 'link' ? (
              <a href={elem.url} target="_blank" rel="noreferrer">
                {elem.text}
              </a>
            ) : null}

            {elem.tag === 'code' ? (
              elem.language == 'text' || !elem.language ? (
                <SyntaxHighlighter language={elem.language} wrapLongLines style={props.codeStyle}>
                  {elem.text}
                  {String(props.codeStyle)}
                </SyntaxHighlighter>
              ) : (
                <>
                  <SyntaxHighlighter language={elem.language} style={props.codeStyle}>
                    {elem.text}
                    {String(props.codeStyle)}
                  </SyntaxHighlighter>
                </>
              )
            ) : null}

            {elem.tag == 'ad' ? <GoogleAdsence /> : null}

            {elem.tag === 'affiliate' ? <Affiliate elem={elem} /> : null}

            {elem.child ? (
              <div
                className={props.documentWrapperClass}
                style={{
                  borderLeft: `${
                    props.indent && elem.tag.match(/^h(2|3|4)/) ? '1px' : '0px'
                  } dashed rgba(0,0,0,0.1)`,
                  borderRight: '0px',
                  borderTop: '0',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    paddingLeft: `${elem.tag.match(/^h(2|3|4)/) ? props.indent : 0}px`,
                    // width: `calc(100% - ${elem.tag !== 'h1' ? props.indent : 0}px)`,
                  }}
                >
                  <AssemblyMarkdown
                    sumbnail=""
                    content={elem.child}
                    id={props.id}
                    indent={props.indent}
                    codeStyle={props.codeStyle}
                  />
                </div>
              </div>
            ) : null}
          </React.Fragment>
        )
      })}
    </>
  )
}

const Index: React.FC<Props> = (props) => {
  useAdsence()
  return <>{AssemblyMarkdown(props)}</>
}

export default React.memo(Index)
