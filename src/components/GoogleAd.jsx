import React, { useEffect } from 'react'

// Google AdSense responsive ad component
// Usage: <GoogleAd slot="1234567890" style={{width:160, height:600}} className="" />
// Replace client id in index.html script or provide VITE_GADS_CLIENT env.

export default function GoogleAd({ slot, className = '', style = {}, format = 'auto', layout = '', responsive = true }) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // ignore during dev/SSR
    }
  }, [slot]);

  // Fallback, index.html'de yüklü gerçek AdSense client ile aynı tutulur
  const client = import.meta.env.VITE_GADS_CLIENT || 'ca-pub-1688340004546677';
  const isTest = import.meta.env.MODE !== 'production' || import.meta.env.VITE_GADS_TEST === 'on';

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: 'block', ...style }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-ad-layout={layout || undefined}
      data-full-width-responsive={responsive ? 'true' : 'false'}
      {...(isTest ? { 'data-adtest': 'on' } : {})}
    />
  )
}
