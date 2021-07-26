import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Config, Volume, NotebookFormObject } from 'src/app/types';
import { Subscription } from 'rxjs';
import {
  NamespaceService,
  BackendService,
  SnackBarService,
  SnackType,
  getNameError,
} from 'kubeflow';
import { Router } from '@angular/router';
import { getFormDefaults, initFormControls } from './utils';
import { JWABackendService } from 'src/app/services/backend.service';
import { environment } from '@app/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-form-default',
  templateUrl: './form-default.component.html',
  styleUrls: ['./form-default.component.scss'],
})
export class FormDefaultComponent implements OnInit, OnDestroy {
  currNamespace = '';
  formCtrl: FormGroup;
  config: Config;

  ephemeral = false;
  defaultStorageclass = false;

  blockSubmit = false;
  formReady = false;
  pvcs: Volume[] = [];
  existingNotebooks = new Set<string>();

  subscriptions = new Subscription();

  constructor(
    public namespaceService: NamespaceService,
    public backend: JWABackendService,
    public router: Router,
    public popup: SnackBarService,
    public translate: TranslateService,
  ) {}

  ngOnInit(): void {
    // Initialize the form control
    this.formCtrl = this.getFormDefaults();

    // Update the form Values from the default ones
    this.backend.getConfig().subscribe(config => {
      if (Object.keys(config).length === 0) {
        // Don't fire on empty config
        return;
      }

      this.config = config;
      this.initFormControls(this.formCtrl, config);
    });

    // Keep track of the selected namespace
    this.subscriptions.add(
      this.namespaceService.getSelectedNamespace().subscribe(namespace => {
        this.currNamespace = namespace;
        this.formCtrl.controls.namespace.setValue(this.currNamespace);

        // Get the PVCs of the new Namespace
        this.backend.getVolumes(namespace).subscribe(pvcs => {
          this.pvcs = pvcs;
        });
      }),
    );

    // Check if a default StorageClass is set
    this.backend.getDefaultStorageClass().subscribe(defaultClass => {
      if (defaultClass.length === 0) {
        this.defaultStorageclass = false;
        this.popup.open(
          this.translate.instant('resourceForm.msgDefaultStorageClass'),
          SnackType.Warning,
          0,
        );
      } else {
        this.defaultStorageclass = true;
      }
    });
  }

  ngOnDestroy() {
    // Unsubscriptions
    this.subscriptions.unsubscribe();
  }

  // Functions for handling the Form Group of the entire Form
  getFormDefaults() {
    return getFormDefaults();
  }

  initFormControls(formCtrl: FormGroup, config: Config) {
    initFormControls(formCtrl, config);
  }

  // Form Actions
  getSubmitNotebook(): NotebookFormObject {
    const notebookCopy = this.formCtrl.value as NotebookFormObject;
    const notebook = JSON.parse(JSON.stringify(notebookCopy));

    // Use the custom image instead
    if (notebook.customImageCheck) {
      notebook.image = notebook.customImage;
    } else if (notebook.serverType === 'group-one') {
      // Set notebook image from imageGroupOne
      notebook.image = notebook.imageGroupOne;
    } else if (notebook.serverType === 'group-two') {
      // Set notebook image from imageGroupTwo
      notebook.image = notebook.imageGroupTwo;
    }

    // Remove unnecessary images from the request sent to the backend
    delete notebook.imageGroupOne;
    delete notebook.imageGroupTwo;

    // Ensure CPU input is a string
    if (typeof notebook.cpu === 'number') {
      notebook.cpu = notebook.cpu.toString();
    }

    // Ensure GPU input is a string
    if (typeof notebook.gpus.num === 'number') {
      notebook.gpus.num = notebook.gpus.num.toString();
    }

    // Remove cpuLimit from request if null
    if (notebook.cpuLimit == null) {
      delete notebook.cpuLimit;
      // Ensure CPU Limit input is a string
    } else if (typeof notebook.cpuLimit === 'number') {
      notebook.cpuLimit = notebook.cpuLimit.toString();
    }

    // Remove memoryLimit from request if null
    if (notebook.memoryLimit == null) {
      delete notebook.memoryLimit;
      // Add Gi to memoryLimit
    } else if (notebook.memoryLimit) {
      notebook.memoryLimit = notebook.memoryLimit.toString() + 'Gi';
    }

    // Add Gi to all sizes
    if (notebook.memory) {
      notebook.memory = notebook.memory.toString() + 'Gi';
    }

    if (notebook.workspace.size) {
      notebook.workspace.size = notebook.workspace.size.toString() + 'Gi';
    }

    if (typeof notebook.language === 'string'){
      notebook.language = notebook.language.toString();
    }

    for (const vol of notebook.datavols) {
      if (vol.size) {
        vol.size = vol.size + 'Gi';
      }
    }

    return notebook;
  }

  onSubmit() {
    const notebook = this.getSubmitNotebook();
    this.backend.createNotebook(notebook).subscribe(() => {
      this.popup.close();
      this.router.navigate(['/']);
    });
  }

  onCancel() {
    this.router.navigate(['/']);
  }
}
