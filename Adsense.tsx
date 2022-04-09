import { useRouter } from 'next/router'
import React, { useEffect } from 'react'

const useAdsence = () => {
  const { asPath } = useRouter()

  useEffect(() => {
    console.log(asPath)

    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (err) {
      console.log(err)
    }
  }, [asPath])

  return true
}

const GoogleAdsence = React.memo(function f(props) {
  // const { asPath } = useRouter()

  return (
    // <div key={asPath}>
    <div>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center', margin: '20px 0px' }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-4828910114488196"
        data-ad-slot="1962337871"
      />
    </div>
  )
})

export { GoogleAdsence, useAdsence }
