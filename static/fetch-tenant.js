(function(){
  if (typeof window === 'undefined' || typeof window.fetch !== 'function') return;

  var DEFAULT_API = 'http://localhost:4000';
  var metaApi = (typeof document !== 'undefined') ? document.querySelector('meta[name="api-base"]') : null;
  var apiCandidate = (typeof window !== 'undefined' && window.API_BASE) ||
                     (typeof window !== 'undefined' && window.process && window.process.env && (window.process.env.api_base || window.process.env.API_BASE)) ||
                     (metaApi && metaApi.content) ||
                     DEFAULT_API;
  var API_ORIGIN = (function(){ try { return new URL(apiCandidate, (typeof location!== 'undefined'? location.href: 'http://localhost/')).origin; } catch (e) { return DEFAULT_API; } })();

  var TENANT_KEY = 'xTenantId';
  var tenantId = '';
  try { tenantId = localStorage.getItem(TENANT_KEY) || ''; } catch(e) { tenantId = ''; }

  function shouldAttach(urlStr){
    try{
      var u = new URL(urlStr, (typeof location!== 'undefined'? location.href: 'http://localhost/'));
      if (u.origin === API_ORIGIN) return true;
      if (u.pathname && u.pathname.indexOf('/api') === 0) return true;
    }catch(e){}
    return false;
  }

  function mergeHeaders(existing){
    try{
      var h = new Headers(existing || {});
      if (tenantId) h.set('x-tenant-id', tenantId);
      return h;
    }catch(e){
      var obj = {};
      if (existing && typeof existing === 'object'){
        try { Object.keys(existing).forEach(function(k){ obj[k] = existing[k]; }); } catch(_){ }
      }
      if (tenantId) obj['x-tenant-id'] = tenantId;
      return obj;
    }
  }

  function captureFromResponse(resp){
    try{
      if (!resp || !resp.headers) return;
      var v = resp.headers.get('x-tenant-id') || resp.headers.get('X-Tenant-Id') || resp.headers.get('tenant-id');
      if (v && v !== tenantId){
        tenantId = v;
        try { localStorage.setItem(TENANT_KEY, tenantId); } catch(e){}
      }
    }catch(e){}
  }

  var _fetch = window.fetch;
  window.fetch = function(input, init){
    try{
      var urlStr = (typeof input === 'string') ? input : (input && input.url) ? input.url : '';
      var newInit = init ? Object.assign({}, init) : {};
      if (shouldAttach(urlStr || '')){
        var baseHeaders = (newInit && newInit.headers) || (input && input.headers);
        newInit.headers = mergeHeaders(baseHeaders);
      }
      var p = _fetch(input, newInit);
      p.then(function(resp){ try { captureFromResponse(resp); } catch(_){}; return resp; }).catch(function(){});
      return p;
    }catch(e){
      return _fetch(input, init);
    }
  };

  window.Tenant = window.Tenant || {
    get: function(){ try { return tenantId || localStorage.getItem(TENANT_KEY) || ''; } catch(e){ return tenantId || ''; } },
    set: function(v){ tenantId = v || ''; try { localStorage.setItem(TENANT_KEY, tenantId); } catch(e){} },
    clear: function(){ tenantId=''; try { localStorage.removeItem(TENANT_KEY); } catch(e){} }
  };
})();
