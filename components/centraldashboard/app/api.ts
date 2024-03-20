import {Router, Request, Response, NextFunction} from 'express';
import {KubernetesService} from './k8s_service';
import {Interval, MetricsService} from './metrics_service';
import {readFile} from 'fs/promises';
import {resolve} from 'path';

export const ERRORS = {
  operation_not_supported: 'Operation not supported',
  invalid_links_config: 'Cannot load dashboard menu link',
  invalid_settings: 'Cannot load dashboard settings',
  invalid_get_filers: 'Failed to load filers',
  invalid_get_user_filers: 'Failed to load user filers',
  invalid_update_filer: 'Failed to update filers'
};

export function apiError(a: {res: Response, error: string, code?: number}) {
  const {res, error} = a;
  const code = a.code || 400;
  return res.status(code).json({
    error,
  });
}

export class Api {
  constructor(
      private k8sService: KubernetesService,
      private metricsService?: MetricsService,
    ) {}


  /**
   * Returns the Express router for the API routes.
   */
  routes(): Router {
    return Router()
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
              if (Interval[req.query.interval] !== undefined) {
                interval = Number(Interval[req.query.interval]);
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
              langLinks = links[req.query.lang];
            }catch(e){
              return apiError({
                res, code: 500,
                error: ERRORS.invalid_links_config,
              });
            }
            res.json(langLinks);
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
          async (req: Request, res: Response) => {
            try{
              const filePath = resolve('./filerShares.json');
              const contents = await readFile(filePath, {encoding: 'utf8'});
              const filers = JSON.parse(contents);
              res.json(filers);
            }catch(e){
              return apiError({
                  res, code: 500,
                  error: ERRORS.invalid_get_filers,
                });
            }
          })
          .post(
            '/create-filer/:namespace',
            async (req: Request, res: Response) => {
              try {
                const cm = await this.k8sService.createUserFilerConfigMap(req.params.namespace, req.body);
                res.json(cm.data);
              }catch(e){
                return apiError({
                  res, code: 500,
                  error: ERRORS.invalid_update_filer,
                });
              }
            })
            .get(
              '/get-filer/:namespace',
              async (req: Request, res: Response) => {
                try {
                  const cm = await this.k8sService.getUserFilerConfigMap(req.params.namespace);
                  res.json(cm.data);
                }catch(e){
                  return apiError({
                    res, code: 500,
                    error: ERRORS.invalid_get_user_filers,
                  });
                }
              })
            .patch(
              '/update-filer/:namespace',
              async (req: Request, res: Response) => {
                try {
                  const cm = await this.k8sService.updateUserFilerConfigMap(req.params.namespace, req.body);
                  res.json(cm.data);
                }catch(e){
                  return apiError({
                    res, code: 500,
                    error: ERRORS.invalid_update_filer,
                  });
                }
              })
              .delete(
                '/delete-filer/:namespace',
                async (req: Request, res: Response) => {
                  try {
                    await this.k8sService.deleteUserFilerConfigMap(req.params.namespace);
                    res.json({});
                  }catch(e){
                    return apiError({
                      res, code: 500,
                      error: ERRORS.invalid_update_filer,
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
