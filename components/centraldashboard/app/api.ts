import {Router, Request, Response, NextFunction} from 'express';
import {KubernetesService} from './k8s_service';
import {Interval, MetricsService} from './metrics_service';
import {readFile} from 'fs/promises';
import {resolve} from 'path';
import NodeCache from 'node-cache';

export const ERRORS = {
  no_metrics_service_configured: 'No metrics service configured',
  operation_not_supported: 'Operation not supported',
  invalid_links_config: 'Cannot load dashboard menu link',
  invalid_banner_config: 'Cannot load banner content',
  invalid_settings: 'Cannot load dashboard settings',
  invalid_get_filers: 'Failed to load filers',
  invalid_get_existing_shares: 'Failed to load existing shares',
  invalid_get_requesting_shares: 'Failed to load requesting shares',
  invalid_create_requesting_shares: 'Failed to create requesting shares configmap',
  invalid_update_requesting_shares: 'Failed to update requesting shares configmap',
  invalid_update_existing_shares: 'Failed to update existing shares configmap',
  invalid_delete_existing_shares: 'Failed to delete existing shares configmap' ,
  invalid_get_shares_errors: 'Failed to load shares errors',
  invalid_delete_shares_errors: 'Failed to delete from shares errors',
  invalid_release_notes: 'Failed to get latest release notes for zone-kubeflow-containers',
};

const releaseNotesCache = "releaseNotes";

export function apiError(a: {res: Response, error: string, code?: number}) {
  const {res, error} = a;
  const code = a.code || 400;
  return res.status(code).json({
    error,
  });
}

export class Api {
  constructor(
      private cache: NodeCache,
      private k8sService: KubernetesService,
      private metricsService?: MetricsService,
    ) {}


  /**
   * Returns the Express router for the API routes.
   */
  routes(): Router {
    return Router()
        .get('/metrics', async (req: Request, res: Response) => {
            if (!this.metricsService) {
                return apiError({
                    res, code: 405,
                    error: ERRORS.operation_not_supported,
                });
            }
            res.json(this.metricsService.getChartsLink());
        })
        .get(
            '/metrics/:type((node|podcpu|podmem))',
            async (req: Request, res: Response) => {
              if (!this.metricsService) {
                return apiError({
                  res, code: 405,
                  error: ERRORS.operation_not_supported,
                });
              }

              let interval = Interval.Last15m;
              const intervalQuery = req.query.interval as string;
              const intervalQueryKey = intervalQuery as keyof typeof Interval;
              if (Interval[intervalQueryKey] !== undefined) {
                  interval = Interval[intervalQueryKey];
              }
              switch (req.params.type) {
                case 'node':
                  res.json(await this.metricsService.getNodeCpuUtilization(
                      interval));
                  break;
                case 'podcpu':
                  res.json(
                      await this.metricsService.getPodCpuUtilization(interval));
                  break;
                case 'podmem':
                  res.json(
                      await this.metricsService.getPodMemoryUsage(interval));
                  break;
                default:
              }
            })
        .get(
            '/namespaces',
            async (_: Request, res: Response) => {
              res.json(await this.k8sService.getNamespaces());
            })
        .get(
            '/activities/:namespace',
            async (req: Request, res: Response) => {
              res.json(await this.k8sService.getEventsForNamespace(
                  req.params.namespace));
            })
        .get(
          '/dashboard-links',
          async (req: Request, res: Response) => {
            const cm = await this.k8sService.getConfigMap();
            let langLinks = {};
            try {
              const links = JSON.parse(cm.data["links"]);
              langLinks = links[req.query.lang as string];
            }catch(e){
              return apiError({
                res, code: 500,
                error: ERRORS.invalid_links_config,
              });
            }
            res.json(langLinks);
          })
        .get(
          '/dashboard-banner',
          async (req: Request, res: Response) => {
            const cm = await this.k8sService.getBannerConfigMap();
            let bannerData = {};
            try {
              const bannerRaw = JSON.parse(cm.data["banner"]);
              bannerData = bannerRaw["notif"];
            }catch(e){
              return apiError({
                res, code: 500,
                error: ERRORS.invalid_banner_config,
              });
            }
            res.json(bannerData);
          })
        .get(
          '/dashboard-settings',
          async (_: Request, res: Response) => {
            const cm = await this.k8sService.getConfigMap();
            let settings = {};
            try {
              settings=JSON.parse(cm.data["settings"]);
            }catch(e){
              return apiError({
                res, code: 500,
                error: ERRORS.invalid_settings,
              });
            }
            res.json(settings);
          })
        .get(
          '/filers',
          async (_: Request, res: Response) => {
            const cm = await this.k8sService.getFilersListConfigMap();
            let filers = [];
            try {
              filers=JSON.parse(cm.data["filers"]);
            }catch(e){
              return apiError({
                res, code: 500,
                error: ERRORS.invalid_get_filers,
              });
            }
            res.json(filers);
          })
        .get(
            '/get-existing-shares/:namespace',
            async (req: Request, res: Response) => {
            try {
                const cm = await this.k8sService.getExistingSharesConfigMap(req.params.namespace);
                res.json(cm.data);
            }catch(e){
                return apiError({
                    res, code: 500,
                    error: ERRORS.invalid_get_existing_shares,
                });
            }
            })
        .get(
            '/get-requesting-shares/:namespace',
            async (req: Request, res: Response) => {
                try {
                    const cm = await this.k8sService.getRequestingSharesConfigMap(req.params.namespace);
                    res.json(cm.data);
                }catch(e){
                    return apiError({
                        res, code: 500,
                        error: ERRORS.invalid_get_requesting_shares,
                    });
                }
            })
        .post(
            '/update-requesting-shares/:namespace',
            async (req: Request, res: Response) => {
                try {
                    const cm = await this.k8sService.updateRequestingSharesConfigMap(req.params.namespace, req.body, req.user.email);
                    res.json(cm.data);
                }catch(e){
                    return apiError({
                        res, code: 500,
                        error: ERRORS.invalid_update_requesting_shares,
                    });
                }
            })
        .delete(
            '/delete-existing-share/:namespace',
            async (req: Request, res: Response) => {
                try {
                    await this.k8sService.deleteFromExistingSharesConfigMap(req.params.namespace, req.body);
                    res.json({});
                }catch(e){
                    return apiError({
                        res, code: 500,
                        error: ERRORS.invalid_delete_existing_shares,
                    });
                }
            })
        .get(
          '/get-shares-errors/:namespace',
          async (req: Request, res: Response) => {
              try {
                  const cm = await this.k8sService.getSharesErrorsConfigMap(req.params.namespace);
                  res.json(cm.data);
              }catch(e){
                  return apiError({
                      res, code: 500,
                      error: ERRORS.invalid_get_shares_errors,
                  });
              }
          })
        .delete(
          '/delete-shares-error/:namespace',
          async (req: Request, res: Response) => {
              try {
                  await this.k8sService.deleteFromSharesErrorsConfigMap(req.params.namespace, req.body);
                  res.json({});
              }catch(e){
                  return apiError({
                      res, code: 500,
                      error: ERRORS.invalid_delete_shares_errors,
                  });
              }
          })
        .get(
          '/releaseNotes',
          async (req: Request, res: Response) => {
              try {
                  const releaseNotesData = this.cache.get(releaseNotesCache);
                  console.log("cache", releaseNotesData);
                  
                  if(releaseNotesData){
                    console.log("cache2");
                    res.json(releaseNotesData);
                  }else{
                    console.log("cache3");
                    const headers: Headers = new Headers();
                    headers.set('Content-Type', 'application/json');
                    headers.set('Accept', 'application/json');

                    const request: RequestInfo = new Request('https://api.github.com/repos/statcan/zone-kubeflow-containers/releases/latest', {
                      method: 'GET',
                      headers,
                    });

                    const data = await fetch(request)
                    .then(res=>{
                      if(!res.ok){
                        const message = ERRORS.invalid_release_notes+': '+res.statusText;
                        console.error(message);
                        
                        throw new Error(message);
                      }else{
                        return res.json();
                      }
                    });

                    // sets the release notes in a cache
                    // to help with the github rate limit.
                    // TTL is in seconds
                    this.cache.set(releaseNotesCache, data, 60*60);
                    console.log("d", data.body);

                    res.json(data);
                  }
              }catch(e){
                  console.error(e);
                  
                  return apiError({
                      res, code: 500,
                      error: ERRORS.invalid_release_notes,
                  });
              }
          });
  }

  resolveLanguage(requested: string[], supported: string[], defaultLang: string) {
    return requested.find(lang => supported.indexOf(lang) > -1) || defaultLang;
  }

  getBrowserLanguages(acceptlanguage: string) {
    if (!acceptlanguage) {
      return [];
    }
    const languages = acceptlanguage.split(',');
    // Append fallbacks not explicit in browser languages.
    // Non-destructive: string keys will be reported back in order of insertion.
    const languagelist = Array.from(new Set(languages.map(lang => lang.split(/-|;/)[0])));
    return languagelist;
  }
}
