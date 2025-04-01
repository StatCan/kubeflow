package controllers

import (
	"context"
	"testing"
	"time"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client/fake"
)

func TestReconcile_NotebookCulling(t *testing.T) {
	// Setup a fake Kubernetes client
	fakeClient := fake.NewClientBuilder().WithScheme(testScheme).Build()
	nc := &NotebookController{
		Client: fakeClient,
		Log:    TestLogger,
	}

	// Create test cases
	testCases := []struct {
		testName      string
		pod          *corev1.Pod
		expectedCull bool
	}{
		{
			testName: "Active notebook pod, should not be culled",
			pod: &corev1.Pod{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "active-notebook",
					Namespace: "test-namespace",
					Annotations: map[string]string{
						LAST_ACTIVITY_ANNOTATION: time.Now().Format(time.RFC3339),
					},
				},
				Status: corev1.PodStatus{Phase: corev1.PodRunning},
			},
			expectedCull: false,
		},
		{
			testName: "Idle notebook pod, should be culled",
			pod: &corev1.Pod{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "idle-notebook",
					Namespace: "test-namespace",
					Annotations: map[string]string{
						LAST_ACTIVITY_ANNOTATION: time.Now().Add(-time.Hour).Format(time.RFC3339),
					},
				},
				Status: corev1.PodStatus{Phase: corev1.PodRunning},
			},
			expectedCull: true,
		},
	}

	for _, c := range testCases {
		t.Run(c.testName, func(t *testing.T) {
			// Create the pod in the fake cluster
			_ = fakeClient.Create(context.TODO(), c.pod)

			// Run reconciliation
			_, err := nc.Reconcile(ctrl.Request{
				NamespacedName: client.ObjectKey{
					Name:      c.pod.Name,
					Namespace: c.pod.Namespace,
				},
			})
			if err != nil {
				t.Fatalf("Reconcile failed: %v", err)
			}

			// Check if pod was deleted
			retrievedPod := &corev1.Pod{}
			err = fakeClient.Get(context.TODO(), client.ObjectKey{
				Name:      c.pod.Name,
				Namespace: c.pod.Namespace,
			}, retrievedPod)

			if c.expectedCull && err == nil {
				t.Errorf("Expected pod to be culled, but it still exists: %s", c.pod.Name)
			} else if !c.expectedCull && err != nil {
				t.Errorf("Expected pod to remain, but it was deleted: %s", c.pod.Name)
			}
		})
	}
}
