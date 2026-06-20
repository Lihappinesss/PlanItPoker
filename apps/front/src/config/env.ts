const resolveRuntimeBaseUrls = () => {
  if (typeof window === 'undefined') {
    return {
      apiBaseUrl: __APP_API_BASE_URL__,
      wsBaseUrl: __APP_WS_BASE_URL__,
    };
  }

  const { protocol, hostname, host, origin } = window.location;
  const isLocalRuntime = hostname === 'localhost' || hostname === '127.0.0.1';
  const runtimeWsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
  const runtimeWsUrl = `${runtimeWsProtocol}//${host}/plan/`;
  const compiledApiIsLocalhost = /localhost|127\.0\.0\.1/.test(__APP_API_BASE_URL__);
  const compiledWsIsLocalhost = /localhost|127\.0\.0\.1/.test(__APP_WS_BASE_URL__);

  return {
    apiBaseUrl: !isLocalRuntime && compiledApiIsLocalhost ? origin : __APP_API_BASE_URL__,
    wsBaseUrl: !isLocalRuntime && compiledWsIsLocalhost ? runtimeWsUrl : __APP_WS_BASE_URL__,
  };
};

const { apiBaseUrl, wsBaseUrl } = resolveRuntimeBaseUrls();

export const API_BASE_URL = apiBaseUrl;
export const WS_BASE_URL = wsBaseUrl;
