/*
 * Kubeflow Auth
 *
 * Access Management API.
 *
 * API version: 1.0.0
 * Contact: kubeflow-engineering@google.com
 * Generated by: Swagger Codegen (https://github.com/swagger-api/swagger-codegen.git)
 */

package kfam

import (
	"encoding/json"
	istioRegister "github.com/kubeflow/kubeflow/components/access-management/pkg/apis/istiorbac/v1alpha1"
	profileRegister "github.com/kubeflow/kubeflow/components/access-management/pkg/apis/kubeflow/v1beta1"
	profilev1beta1 "github.com/kubeflow/kubeflow/components/profile-controller/api/v1beta1"
	log "github.com/sirupsen/logrus"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/runtime/serializer"
	"k8s.io/client-go/informers"
	clientset "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/kubernetes/scheme"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
	"k8s.io/client-go/rest"
	"net/http"
	"net/url"
	"path"
	"sigs.k8s.io/controller-runtime/pkg/client/config"
	"strconv"
	"time"
)

type KfamV1Alpha1Interface interface {
	CreateBinding(w http.ResponseWriter, r *http.Request)
	CreateProfile(w http.ResponseWriter, r *http.Request)
	DeleteBinding(w http.ResponseWriter, r *http.Request)
	DeleteProfile(w http.ResponseWriter, r *http.Request)
	ReadBinding(w http.ResponseWriter, r *http.Request)
	QueryClusterAdmin(w http.ResponseWriter, r *http.Request)
}

type KfamV1Alpha1Client struct {
	profileClient ProfileInterface
	bindingClient BindingInterface
	clusterAdmin []string
	userIdHeader string
	userIdPrefix string
}

func NewKfamClient(userIdHeader string, userIdPrefix string, clusterAdmin string) (*KfamV1Alpha1Client, error) {
	profileRESTClient, err := getRESTClient(profileRegister.GroupName, profileRegister.GroupVersion)
	if err != nil {
		return nil, err
	}
	istioRESTClient, err := getRESTClient(istioRegister.GroupName, istioRegister.GroupVersion)
	if err != nil {
		return nil, err
	}
	restconfig, err := config.GetConfig()
	if err != nil {
		return nil, err
	}
	kubeClient, err := clientset.NewForConfig(restconfig)
	if err != nil {
		return nil, err
	}

	informerFactory := informers.NewSharedInformerFactory(kubeClient, time.Minute * 60)
	roleBindingLister := informerFactory.Rbac().V1().RoleBindings().Lister()
	stop := make(chan struct{})
	informerFactory.Start(stop)
	informerFactory.WaitForCacheSync(stop)

	return &KfamV1Alpha1Client{
		profileClient: &ProfileClient{
			restClient: profileRESTClient,
		},
		bindingClient: &BindingClient{
			restClient: 	istioRESTClient,
			kubeClient: 	kubeClient,
			roleBindingLister: roleBindingLister,
		},
		clusterAdmin: []string{clusterAdmin},
		userIdHeader: userIdHeader,
		userIdPrefix: userIdPrefix,
	}, nil
}

func getRESTClient(group string, version string) (*rest.RESTClient, error) {
	restconfig, err := config.GetConfig()
	if err != nil {
		return nil, err
	}
	restconfig.ContentConfig.GroupVersion = &schema.GroupVersion{Group: group, Version: version}
	restconfig.APIPath = "/apis"
	restconfig.NegotiatedSerializer = serializer.DirectCodecFactory{CodecFactory: scheme.Codecs}
	restconfig.UserAgent = rest.DefaultKubernetesUserAgent()
	return rest.RESTClientFor(restconfig)
}

func (c *KfamV1Alpha1Client) CreateBinding(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	const action = "create"
	var binding Binding
	if err := json.NewDecoder(r.Body).Decode(&binding); err != nil {
		IncRequestErrorCounter("decode request error", "", action, r.URL.Path,
			SEVERITY_MAJOR)
		writeResponse(w, []byte(err.Error()))
		w.WriteHeader(http.StatusForbidden)
		return
	}
	// check permission before create binding
	useremail := c.getUserEmail(r.Header)
	if c.isOwnerOrAdmin(useremail, binding.ReferredNamespace) {
		err := c.bindingClient.Create(&binding, c.userIdHeader, c.userIdPrefix)
		if err != nil {
			IncRequestErrorCounter(err.Error(), useremail, action, r.URL.Path,
				SEVERITY_MAJOR)
			w.WriteHeader(http.StatusForbidden)
			writeResponse(w, []byte(err.Error()))
			return
		}
		IncRequestCounter("", useremail, action, r.URL.Path)
		w.WriteHeader(http.StatusOK)
	} else {
		IncRequestCounter("forbidden", useremail, action, r.URL.Path)
		w.WriteHeader(http.StatusForbidden)
	}
}

func (c *KfamV1Alpha1Client) CreateProfile(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	const action = "create"
	var profile profilev1beta1.Profile
	if err := json.NewDecoder(r.Body).Decode(&profile); err != nil {
		IncRequestErrorCounter("decode error", "", action, r.URL.Path,
			SEVERITY_MAJOR)
		writeResponse(w, []byte(err.Error()))
		w.WriteHeader(http.StatusForbidden)
		return
	}
	_, err := c.profileClient.Create(&profile)
	if err != nil {
		IncRequestErrorCounter(err.Error(), "", action, r.URL.Path,
			SEVERITY_MAJOR)
		w.WriteHeader(http.StatusForbidden)
		writeResponse(w, []byte(err.Error()))
		return
	}
	IncRequestCounter("", "", action, r.URL.Path)
	w.WriteHeader(http.StatusOK)
}

func (c *KfamV1Alpha1Client) DeleteBinding(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	const action = "delete"
	var binding Binding
	if err := json.NewDecoder(r.Body).Decode(&binding); err != nil {
		IncRequestErrorCounter("decode error", "", action, r.URL.Path,
			SEVERITY_MAJOR)
		writeResponse(w, []byte(err.Error()))
		w.WriteHeader(http.StatusForbidden)
		return
	}
	// check permission before delete
	useremail := c.getUserEmail(r.Header)
	if c.isOwnerOrAdmin(useremail, binding.ReferredNamespace) {
		err := c.bindingClient.Delete(&binding)
		if err != nil {
			IncRequestErrorCounter(err.Error(), useremail, action, r.URL.Path,
				SEVERITY_MAJOR)
			w.WriteHeader(http.StatusForbidden)
			writeResponse(w, []byte(err.Error()))
			return
		}
		IncRequestCounter("", useremail, action, r.URL.Path)
		w.WriteHeader(http.StatusOK)
	} else {
		IncRequestCounter("forbidden", useremail, action, r.URL.Path)
		w.WriteHeader(http.StatusForbidden)
	}
}

func (c *KfamV1Alpha1Client) DeleteProfile(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	const action = "delete"
	useremail := c.getUserEmail(r.Header)
	profileName := path.Base(r.RequestURI)
	// check permission before delete
	if c.isOwnerOrAdmin(useremail, profileName) {
		err := c.profileClient.Delete(profileName, nil)
		if err != nil {
			IncRequestErrorCounter(err.Error(), useremail, action, r.URL.Path,
				SEVERITY_MAJOR)
			w.WriteHeader(http.StatusUnauthorized)
			writeResponse(w, []byte(err.Error()))
			return
		}
		IncRequestCounter("", useremail, action, r.URL.Path)
		w.WriteHeader(http.StatusOK)
	} else {
		IncRequestCounter("forbidden", useremail, action, r.URL.Path)
		w.WriteHeader(http.StatusUnauthorized)
	}
}

func (c *KfamV1Alpha1Client) ReadBinding(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	const action = "read"
	queries, err := url.ParseQuery(r.URL.RawQuery)
	if err != nil {
		IncRequestErrorCounter(err.Error(), "", action, r.URL.Path,
			SEVERITY_MAJOR)
		w.WriteHeader(http.StatusForbidden)
		writeResponse(w, []byte(err.Error()))
		return
	}
	namespaces := []string{}
	// by default scan all namespaces created by profile CR
	if queries.Get("namespace") == "" {
		profList, err := c.profileClient.List(metav1.ListOptions{})
		if err != nil {
			w.WriteHeader(http.StatusForbidden)
			writeResponse(w, []byte(err.Error()))
		}
		for _, profile := range profList.Items {
			namespaces = append(namespaces, profile.Name)
		}
	} else {
		namespaces = append(namespaces, queries.Get("namespace"))
	}
	bindingList, err := c.bindingClient.List(queries.Get("user"), namespaces, queries.Get("role"))
	if err != nil {
		IncRequestErrorCounter(err.Error(), "", action, r.URL.Path,
			SEVERITY_MAJOR)
		w.WriteHeader(http.StatusUnauthorized)
		writeResponse(w, []byte(err.Error()))
		return
	}
	result, err := json.Marshal(*bindingList)
	if err != nil {
		IncRequestErrorCounter(err.Error(), "", action, r.URL.Path,
			SEVERITY_MAJOR)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	IncRequestCounter("", "", action, r.URL.Path)
	if writeResponse(w, result) {
		w.WriteHeader(http.StatusOK)
	} else {
		w.WriteHeader(http.StatusInternalServerError)
	}
}

func (c *KfamV1Alpha1Client) QueryClusterAdmin(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	const action = "read"
	queries, err := url.ParseQuery(r.URL.RawQuery)
	if err != nil {
		IncRequestErrorCounter(err.Error(), "", action, r.URL.Path,
			SEVERITY_MAJOR)
		w.WriteHeader(http.StatusForbidden)
		writeResponse(w, []byte(err.Error()))
		return
	}
	queryUser := queries.Get("user")
	if writeResponse(w, []byte(strconv.FormatBool(c.isClusterAdmin(queryUser)))) {
		IncRequestCounter("", "", action, r.URL.Path)
		w.WriteHeader(http.StatusOK)
	} else {
		IncRequestErrorCounter(err.Error(), "", action, r.URL.Path,
			SEVERITY_MAJOR)
		w.WriteHeader(http.StatusInternalServerError)
	}
}

// writeResponse will write msg to w, log any error that occurs, and return whether the write succeeded.
func writeResponse(w http.ResponseWriter, msg []byte) bool {
	if _, err := w.Write(msg); err != nil {
		log.Errorf("Failed to write message with ResponseWriter: %v", err)
		return false
	}
	return true
}

func (c *KfamV1Alpha1Client) getUserEmail(header http.Header) string {
	return header.Get(c.userIdHeader)[len(c.userIdPrefix):]
}

func (c *KfamV1Alpha1Client) isClusterAdmin(queryUser string) bool {
	for _, val := range c.clusterAdmin {
		if val == queryUser {
			return true
		}
	}
	return false
}

//isOwnerOrAdmin return true if queryUser is cluster admin or profile owner
func (c *KfamV1Alpha1Client) isOwnerOrAdmin(queryUser string, profileName string) bool {
	isAdmin := c.isClusterAdmin(queryUser)
	prof, err := c.profileClient.Get(profileName, metav1.GetOptions{})
	if err != nil {
		return false
	}
	return isAdmin || (prof.Spec.Owner.Name == queryUser)
}
