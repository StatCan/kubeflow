import { Component, OnInit, Input } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
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

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    this.parentForm = new FormGroup({
      shm: new FormControl(),
      language: new FormControl()
    })
    this.parentForm.controls.language.setValue(this.translate.defaultLang);
  }
}