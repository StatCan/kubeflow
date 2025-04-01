package controllers

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"time"

	corev1 "k8s.io/api/core/v1"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"
)

type NotebookCullingReconciler struct {
	client.Client
	HTTPClient *http.Client
}

const (
	LastActivityAnnotation = "notebooks.kubeflow.org/last-activity"
	CullingThreshold       = 30 * time.Minute // Example threshold
)

func (r *NotebookCullingReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	logger := log.FromContext(ctx)

	var pod corev1.Pod
	if err := r.Get(ctx, req.NamespacedName, &pod); err != nil {
		logger.Error(err, "Failed to get Notebook pod")
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}

	if !r.isNotebookPod(pod) {
		return ctrl.Result{}, nil
	}

	lastActivity, err := r.getLastActivity(ctx, &pod)
	if err != nil {
		logger.Error(err, "Error fetching last activity")
		return ctrl.Result{}, err
	}

	if time.Since(lastActivity) > CullingThreshold {
		logger.Info("Culling notebook", "pod", pod.Name)
		if err := r.Delete(ctx, &pod); err != nil {
			logger.Error(err, "Failed to delete culled notebook")
			return ctrl.Result{}, err
		}
	}

	return ctrl.Result{RequeueAfter: 5 * time.Minute}, nil
}

func (r *NotebookCullingReconciler) isNotebookPod(pod corev1.Pod) bool {
	_, exists := pod.Annotations[LastActivityAnnotation]
	return exists
}

func (r *NotebookCullingReconciler) getLastActivity(ctx context.Context, pod *corev1.Pod) (time.Time, error) {
	ann, exists := pod.Annotations[LastActivityAnnotation]
	if !exists {
		return time.Time{}, errors.New("missing last activity annotation")
	}
	parsedTime, err := time.Parse(time.RFC3339, ann)
	if err != nil {
		return time.Time{}, fmt.Errorf("invalid last activity format: %w", err)
	}
	return parsedTime, nil
}

func (r *NotebookCullingReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&corev1.Pod{}).
		Complete(r)
}
