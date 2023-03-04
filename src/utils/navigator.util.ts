interface NavigatorBrandVersion {
  readonly brand: string;
  readonly version: string;
}

interface NavigatorUserAgentData {
  readonly brands: NavigatorBrandVersion[];
  readonly mobile: boolean;
  readonly platform: string;
}

declare global {
  interface Navigator {
    userAgentData?: NavigatorUserAgentData;
  }
}

export const isMacOs = () => {
  const userAgent = navigator?.userAgent;
  if (userAgent.indexOf('Mac') !== -1) return true;
  const platform = navigator?.userAgentData?.platform ?? navigator?.platform;
  return platform.indexOf('mac') !== -1;
};
