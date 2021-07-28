import { Component, OnInit, Input, ChangeDetectorRef } from "@angular/core";
import {FormGroup } from "@angular/forms";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "app-form-advanced-options",
  templateUrl: "./form-advanced-options.component.html",
  styleUrls: [
    "./form-advanced-options.component.scss"
  ]
})
export class FormAdvancedOptionsComponent implements OnInit {
  @Input() parentForm: FormGroup;
  languageList = [
    {'id':'en', 'label':'jupyter.formAdvancedOptions.lblEnglish'},
    {'id':'fr', 'label':'jupyter.formAdvancedOptions.lblFrench'}    
  ];

  constructor(private translate: TranslateService, private cdr: ChangeDetectorRef) {}
  ngOnInit() { 

    }

    ngAfterViewChecked() {
      this.parentForm.get('language').setValue(this.translate.defaultLang)
      this.cdr.detectChanges();
    }
  }
