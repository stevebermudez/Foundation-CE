// Google Analytics and Facebook Pixel integration
// Reference: javascript_google_analytics blueprint

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
    _fbq: any;
  }
}

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('Google Analytics: VITE_GA_MEASUREMENT_ID not configured');
    return;
  }

  // Add Google Analytics script to the head
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize gtag
  const script2 = document.createElement('script');
  script2.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
  document.head.appendChild(script2);
};

// Initialize Facebook Pixel
export const initFacebookPixel = () => {
  const pixelId = import.meta.env.VITE_FACEBOOK_PIXEL_ID;

  if (!pixelId) {
    console.warn('Facebook Pixel: VITE_FACEBOOK_PIXEL_ID not configured');
    return;
  }

  // Facebook Pixel base code
  const script = document.createElement('script');
  script.textContent = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);

  // Add noscript fallback
  const noscript = document.createElement('noscript');
  const img = document.createElement('img');
  img.height = 1;
  img.width = 1;
  img.style.display = 'none';
  img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
  noscript.appendChild(img);
  document.body.appendChild(noscript);
};

// Initialize all analytics
export const initAnalytics = () => {
  initGA();
  initFacebookPixel();
};

// Track page views for Google Analytics (useful for SPA navigation)
export const trackPageView = (url: string) => {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (measurementId) {
      window.gtag('config', measurementId, {
        page_path: url
      });
    }
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};

// Track custom events for Google Analytics
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track Facebook standard events
export const trackFacebookEvent = (
  eventName: string,
  parameters?: Record<string, any>
) => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  window.fbq('track', eventName, parameters);
};

// Common conversion events
export const trackPurchase = (value: number, currency: string = 'USD', contentIds?: string[]) => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      value: value,
      currency: currency,
      items: contentIds?.map(id => ({ item_id: id }))
    });
  }
  
  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      value: value,
      currency: currency,
      content_ids: contentIds
    });
  }
};

export const trackAddToCart = (value: number, currency: string = 'USD', contentId?: string) => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'add_to_cart', {
      value: value,
      currency: currency,
      items: contentId ? [{ item_id: contentId }] : []
    });
  }
  
  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', 'AddToCart', {
      value: value,
      currency: currency,
      content_ids: contentId ? [contentId] : []
    });
  }
};

export const trackSignUp = (method?: string) => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'sign_up', { method });
  }
  
  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', 'CompleteRegistration');
  }
};

export const trackBeginCheckout = (value: number, currency: string = 'USD') => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'begin_checkout', { value, currency });
  }
  
  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', { value, currency });
  }
};
