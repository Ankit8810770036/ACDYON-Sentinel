export interface IdentityProfile {
  id: string;
  name: string;
  userAgent: string;
  secChUa: string;
  secChUaPlatform: string;
  secChUaMobile: string;
  acceptLanguage: string;
  acceptEncoding: string;
  headerOrder: string[];
  tlsFingerprintJa3: string;
}

export const BROWSER_IDENTITIES: IdentityProfile[] = [
  {
    id: 'chrome-win11',
    name: 'Chrome 122 (Windows 11 x64)',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    secChUa: '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    secChUaPlatform: '"Windows"',
    secChUaMobile: '?0',
    acceptLanguage: 'en-US,en;q=0.9,hi;q=0.8',
    acceptEncoding: 'gzip, deflate, br, zstd',
    headerOrder: ['Host', 'Sec-Ch-Ua', 'Sec-Ch-Ua-Mobile', 'Sec-Ch-Ua-Platform', 'Upgrade-Insecure-Requests', 'User-Agent', 'Accept', 'Sec-Fetch-Site', 'Sec-Fetch-Mode', 'Sec-Fetch-User', 'Sec-Fetch-Dest', 'Accept-Encoding', 'Accept-Language'],
    tlsFingerprintJa3: '771,4865-4866-4867-49195-49199-49196-49200-52393-52392,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-21,29-23-24,0'
  },
  {
    id: 'safari-mac',
    name: 'Safari 17.3 (macOS Sonoma)',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
    secChUa: '',
    secChUaPlatform: '"macOS"',
    secChUaMobile: '?0',
    acceptLanguage: 'en-US,en;q=0.9',
    acceptEncoding: 'gzip, deflate, br',
    headerOrder: ['Host', 'User-Agent', 'Accept', 'Accept-Language', 'Accept-Encoding', 'Connection', 'Sec-Fetch-Dest', 'Sec-Fetch-Mode', 'Sec-Fetch-Site'],
    tlsFingerprintJa3: '771,49195-49199-49196-49200-52393-52392-49161-49171,0-13-5-11-16-10-23-65281,29-23-24,0'
  },
  {
    id: 'firefox-linux',
    name: 'Firefox 123 (Ubuntu x86_64)',
    userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0',
    secChUa: '',
    secChUaPlatform: '"Linux"',
    secChUaMobile: '?0',
    acceptLanguage: 'en-US,en;q=0.5',
    acceptEncoding: 'gzip, deflate, br',
    headerOrder: ['Host', 'User-Agent', 'Accept', 'Accept-Language', 'Accept-Encoding', 'DNT', 'Connection', 'Upgrade-Insecure-Requests', 'Sec-Fetch-Dest', 'Sec-Fetch-Mode', 'Sec-Fetch-Site'],
    tlsFingerprintJa3: '771,4865-4866-4867-49195-49199-49196-49200-52393-52392,0-23-65281-10-11-16-5-13-51,29-23-24,0'
  },
  {
    id: 'edge-win11',
    name: 'Edge 122 (Windows 11 x64)',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
    secChUa: '"Chromium";v="122", "Not(A:Brand";v="24", "Microsoft Edge";v="122"',
    secChUaPlatform: '"Windows"',
    secChUaMobile: '?0',
    acceptLanguage: 'en-US,en;q=0.9',
    acceptEncoding: 'gzip, deflate, br, zstd',
    headerOrder: ['Host', 'Sec-Ch-Ua', 'Sec-Ch-Ua-Mobile', 'Sec-Ch-Ua-Platform', 'User-Agent', 'Accept', 'Sec-Fetch-Site', 'Sec-Fetch-Mode', 'Sec-Fetch-User', 'Sec-Fetch-Dest', 'Accept-Encoding', 'Accept-Language'],
    tlsFingerprintJa3: '771,4865-4866-4867-49195-49199-49196-49200-52393-52392,0-23-65281-10-11-35-16-5-13-18-51,29-23-24,0'
  }
];

export class IdentityRotator {
  private currentIndex = 0;

  public getNextIdentity(enabled: boolean): IdentityProfile {
    if (!enabled) {
      return BROWSER_IDENTITIES[0];
    }
    const profile = BROWSER_IDENTITIES[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % BROWSER_IDENTITIES.length;
    return profile;
  }

  public getRandomIdentity(): IdentityProfile {
    const idx = Math.floor(Math.random() * BROWSER_IDENTITIES.length);
    return BROWSER_IDENTITIES[idx];
  }

  public getHeaders(profile: IdentityProfile): Record<string, string> {
    const headers: Record<string, string> = {
      'User-Agent': profile.userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webkit,*/*;q=0.8',
      'Accept-Language': profile.acceptLanguage,
      'Accept-Encoding': profile.acceptEncoding,
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Upgrade-Insecure-Requests': '1',
    };

    if (profile.secChUa) {
      headers['Sec-Ch-Ua'] = profile.secChUa;
      headers['Sec-Ch-Ua-Mobile'] = profile.secChUaMobile;
      headers['Sec-Ch-Ua-Platform'] = profile.secChUaPlatform;
    }

    return headers;
  }
}
