import * as k8s from '@kubernetes/client-node';

/** Retrieve Dashboard configmap Name */
const {
  DASHBOARD_CONFIGMAP = "centraldashboard-config",
  LOGOUT_URL = '/logout'
} = process.env;

/** Information about the Kubernetes hosting platform. */
export interface PlatformInfo {
  provider: string;
  providerName: string;
  kubeflowVersion: string;
  logoutUrl: string;
}

/**
 * Relevant fields from the description property of the Application CRD
 * https://github.com/kubernetes-sigs/application/blob/master/config/crds/app_v1beta1_application.yaml
 */
interface V1BetaApplicationDescriptor {
  version: string;
  type: string;
  description: string;
}

/**
 * Relevant fields from the spec property of the Application CRD
 * https://github.com/kubernetes-sigs/application/blob/master/config/crds/app_v1beta1_application.yaml
 */
interface V1BetaApplicationSpec {
  descriptor: V1BetaApplicationDescriptor;
}

/** Generic definition of the Kubeflow Application CRD */
interface V1BetaApplication {
  apiVersion: string;
  kind: string;
  metadata?: k8s.V1ObjectMeta;
  spec: V1BetaApplicationSpec;
}

interface V1BetaApplicationList {
  items: V1BetaApplication[];
}

const APP_API_GROUP = 'app.k8s.io';
const APP_API_VERSION = 'v1beta1';
const APP_API_NAME = 'applications';
const REQUESTING_SHARES_CM_NAME = 'requesting-shares';
const EXISTING_SHARES_CM_NAME = 'existing-shares';
const SHARES_ERRORS_CM_NAME = 'shares-errors';

/** Wrap Kubernetes API calls in a simpler interface for use in routes. */
export class KubernetesService {
  private namespace = 'kubeflow';
  private coreAPI: k8s.CoreV1Api;
  private customObjectsAPI: k8s.CustomObjectsApi;
  private dashboardConfigMap = DASHBOARD_CONFIGMAP;

  constructor(private kubeConfig: k8s.KubeConfig) {
    console.info('Initializing Kubernetes configuration');
    this.kubeConfig.loadFromDefault();
    const context =
        this.kubeConfig.getContextObject(this.kubeConfig.getCurrentContext());
    if (context && context.namespace) {
      this.namespace = context.namespace;
    }
    this.coreAPI = this.kubeConfig.makeApiClient(k8s.CoreV1Api);
    this.customObjectsAPI =
        this.kubeConfig.makeApiClient(k8s.CustomObjectsApi);
  }

  /** Retrieves the list of namespaces from the Cluster. */
  async getNamespaces(): Promise<k8s.V1Namespace[]> {
    try {
      const {body} = await this.coreAPI.listNamespace();
      return body.items;
    } catch (err) {
      console.error('Unable to fetch Namespaces:', err.body || err);
      return [];
    }
  }

  /** Retrieves the configmap data for the central dashboard. */
  async getConfigMap(): Promise<k8s.V1ConfigMap> {
    try {
      const { body } = await this.coreAPI.readNamespacedConfigMap(this.dashboardConfigMap,this.namespace);
      return body;
    } catch (err) {
      console.error('Unable to fetch ConfigMap:', err.response?.body || err.body || err);
      return null;
    }
  }

  /** Retrieves the user allowlist for the DEV central dashboard. */
  async getAllowlistConfigMap(): Promise<k8s.V1ConfigMap> {
    try {
      const { body } = await this.coreAPI.readNamespacedConfigMap("centraldashboard-allowlist", this.namespace);
      return body;
    } catch (err) {
      if(err.statusCode === 404){
        //No allowlist probably means not in DEV env.
        return null;
      }
      console.error('Unable to fetch ConfigMap:', err.response?.body || err.body || err);
      throw err;
    }
  }

  /** Retrieves the configmap data for the list of filers. */
  async getFilersListConfigMap(): Promise<k8s.V1ConfigMap> {
    try {
      const { body } = await this.coreAPI.readNamespacedConfigMap("filers-list", "das");
      return body;
    } catch (err) {
      console.error('Unable to fetch fielrs list ConfigMap:', err.response?.body || err.body || err);
      return null;
    }
  }

  /** Retrieves the existing shares configmap data for the central dashboard. */
  async getExistingSharesConfigMap(namespace: string): Promise<k8s.V1ConfigMap> {
    try {
      const { body } = await this.coreAPI.readNamespacedConfigMap(EXISTING_SHARES_CM_NAME, namespace);
      return body;
    } catch (err) {
      if(err.statusCode === 404){
        //user has no existing-shares yet
        return new k8s.V1ConfigMap();
      }
      console.error('Unable to fetch ConfigMap:', err.response?.body || err.body || err);
      throw err;
    }
  }

  /** Retrieves the requesting shares configmap data for the central dashboard. */
  async getRequestingSharesConfigMap(namespace: string): Promise<k8s.V1ConfigMap> {
    try {
      const { body } = await this.coreAPI.readNamespacedConfigMap(REQUESTING_SHARES_CM_NAME, namespace);
      return body;
    } catch (err) {
      if(err.statusCode === 404){
        //user has no requesting-shares yet
        return new k8s.V1ConfigMap();
      }
      console.error('Unable to fetch ConfigMap:', err.response?.body || err.body || err);
      throw err;
    }
  }

  /** Retrieves the shares errors configmap data for the central dashboard. */
  async getSharesErrorsConfigMap(namespace: string): Promise<k8s.V1ConfigMap> {
    try {
      const { body } = await this.coreAPI.readNamespacedConfigMap(SHARES_ERRORS_CM_NAME, namespace);
      return body;
    } catch (err) {
      if(err.statusCode === 404){
        //user has no shares-errors yet
        return new k8s.V1ConfigMap();
      }
      console.error('Unable to fetch ConfigMap:', err.response?.body || err.body || err);
      throw err;
    }
  }

  /** Updates the requesting shares configmap for the central dashboard; Creates the configmap if it is not created. */
  async updateRequestingSharesConfigMap(namespace: string, data: {svm: string, share: string}, email: string): Promise<k8s.V1ConfigMap> {
    try {
      //try to get the configmap to see if it exists
      const getPromise = await this.coreAPI.readNamespacedConfigMap(REQUESTING_SHARES_CM_NAME, namespace);
      const requestingCM = getPromise.body; 

      const svmSharesData: string[] = JSON.parse(requestingCM.data[data.svm]);
      svmSharesData.push(data.share);

      requestingCM.data[data.svm] = JSON.stringify(svmSharesData);
      
      const { body } = await this.coreAPI.replaceNamespacedConfigMap(REQUESTING_SHARES_CM_NAME, namespace, requestingCM);
      return body;
    } catch (err) {
      if(err.statusCode === 404){
        //user has no requesting-shares yet, so we create it
        const dataValue:{[key:string]:string} = {};
        dataValue[data.svm]=JSON.stringify([data.share]);

        const config = {
          metadata: {
            name: REQUESTING_SHARES_CM_NAME,
            labels: {
              "for-ontap": "true"
            },
            annotations: {
              "user-email": email
            }
          },
          data: dataValue
        } as k8s.V1ConfigMap;

        const { body } = await this.coreAPI.createNamespacedConfigMap(namespace, config);
        return body;
      }
      console.error('Unable to update ConfigMap:', err.response?.body || err.body || err);
      throw err;
    }
  }

  /** Deletes from the existing shares configmap for the central dashboard. */
  async deleteFromExistingSharesConfigMap(namespace: string, data: {svm: string, share: string}): Promise<k8s.V1Status> {
    try {
      const getPromise = await this.coreAPI.readNamespacedConfigMap(EXISTING_SHARES_CM_NAME, namespace);
      const existingCM = getPromise.body; 

      const svmSharesData: string[] = JSON.parse(existingCM.data[data.svm])

      const deleteIndex = svmSharesData.indexOf(data.share)
      svmSharesData.splice(deleteIndex, 1);

      //if CM would be empty, just delete it
      if (svmSharesData.length === 0 && Object.keys(existingCM.data).length===1){
        const deletePromise = await this.coreAPI.deleteNamespacedConfigMap(EXISTING_SHARES_CM_NAME, namespace);
        return deletePromise.body;
      }

      existingCM.data[data.svm] = JSON.stringify(svmSharesData);
      
      const { body } = await this.coreAPI.replaceNamespacedConfigMap(EXISTING_SHARES_CM_NAME, namespace, existingCM);
      return body;
    } catch (err) {
      console.error('Unable to delete from ConfigMap:', err.response?.body || err.body || err);
      throw err;
    }
  }

  /** Removes a value from the shares-errors configmap; Deletes the configmap if it would be empty */
  async deleteFromSharesErrorsConfigMap(namespace: string, data: {ErrorMessage: string, Svm: string, Share: string, Timestamp: string}): Promise<k8s.V1ConfigMap> {
    try {
      const getPromise = await this.coreAPI.readNamespacedConfigMap(SHARES_ERRORS_CM_NAME, namespace);
      
      const errorsData:Array<{ErrorMessage: string, Svm: string, Share: string, Timestamp: string}> = JSON.parse(getPromise.body.data.errors)

      //find the index of the element to delete
      const deleteIndex = errorsData.findIndex(d => 
        d.ErrorMessage === data.ErrorMessage &&
        d.Share === data.Share &&
        d.Svm === data.Svm &&
        d.Timestamp === data.Timestamp
      );

      //delete element
      errorsData.splice(deleteIndex, 1)

      //delete the CM if the value would be empty
      if(errorsData.length===0){
        const deletePromise = await this.coreAPI.deleteNamespacedConfigMap(SHARES_ERRORS_CM_NAME, namespace);
        return deletePromise.body;
      }

      const config = {
        metadata: {
          name: SHARES_ERRORS_CM_NAME
        },
        data: {
          errors: JSON.stringify(errorsData)
        }
      } as k8s.V1ConfigMap;
      
      //Update the configmap
      const { body } = await this.coreAPI.replaceNamespacedConfigMap(SHARES_ERRORS_CM_NAME, namespace, config);
      return body;
    } catch (err) {
      console.error('Unable to delete from ConfigMap:', err.response?.body || err.body || err);
      throw err;
    }
  }

  /** Retrieves the list of events for the given Namespace from the Cluster. */
  async getEventsForNamespace(namespace: string): Promise<k8s.V1Event[]> {
    try {
      const {body} = await this.coreAPI.listNamespacedEvent(namespace);
      return body.items;
    } catch (err) {
      console.error(
          `Unable to fetch Events for ${namespace}:`, err.body || err);
      return [];
    }
  }

  /**
   * Obtains cloud platform information from cluster Nodes,
   * as well as the Kubeflow version from the Application custom resource.
   */
  async getPlatformInfo(): Promise<PlatformInfo> {
    try {
      const [provider, version] =
          await Promise.all([this.getProvider(), this.getKubeflowVersion()]);
      return {
        kubeflowVersion: version,
        provider,
        providerName: provider.split(':')[0],
        logoutUrl : LOGOUT_URL,
      };
    } catch (err) {
      console.error('Unexpected error', err);
      throw err;
    }
  }

  /**
   * Retrieves Kubernetes Node information.
   */
  async getNodes(): Promise<k8s.V1Node[]> {
    try {
      const {body} = await this.coreAPI.listNode();
      return body.items;
    } catch (err) {
      console.error('Unable to fetch Nodes', err.body || err);
      return [];
    }
  }

  /**
   * Returns the provider identifier or 'other://' from the K8s cluster.
   */
  private async getProvider(): Promise<string> {
    let provider = 'other://';
    try {
      const nodes = await this.getNodes();
      const foundProvider = nodes.map((n) => n.spec.providerID).find(Boolean);
      if (foundProvider) {
        provider = foundProvider;
      }
    } catch (err) {
      console.error('Unable to fetch Node information:', err.body || err);
    }
    return provider;
  }

  /**
   * Returns the Kubeflow version from the Application custom resource or
   * 'unknown'.
   */
  private async getKubeflowVersion(): Promise<string> {
    let version = 'unknown';
    try {
      // tslint:disable-next-line: no-any
      const _ = (o: any) => o || {};
      const response = await this.customObjectsAPI.listNamespacedCustomObject(
          APP_API_GROUP, APP_API_VERSION, this.namespace, APP_API_NAME);
      const body = response.body as V1BetaApplicationList;
      const kubeflowApp = (body.items || [])
        .find((app) =>
          /^kubeflow$/i.test(_(_(_(app).spec).descriptor).type)
        );
      if (kubeflowApp) {
        version = kubeflowApp.spec.descriptor.version;
      }
    } catch (err) {
      console.error('Unable to fetch Application information:', err.body || err);
    }
    return version;
  }
}
