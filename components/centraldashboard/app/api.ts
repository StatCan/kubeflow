import {Router, Request, Response, NextFunction} from 'express';
import {KubernetesService} from './k8s_service';
import {Interval, MetricsService} from './metrics_service';

export const ERRORS = {
  operation_not_supported: 'Operation not supported',
  invalid_links_config: 'Dashboard Links ConfigMap is invalid'
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
            const acceptlanguage = req.header('accept-language');
            const linksData = await this.k8sService.getDashboardLinks();
            let langLinks = {};
            try {
              const links = JSON.parse(linksData.data["links"]);
              const lang = this.resolveLanguage (
                this.getBrowserLanguages(acceptlanguage), 
                Object.getOwnPropertyNames(links), 
                linksData.data["defaultLanguage"]
              );
              langLinks = links[lang];
            }catch(e){
              return apiError({
                res, code: 500,
                error: ERRORS.invalid_links_config,
              });
            }
            res.json(langLinks);
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
