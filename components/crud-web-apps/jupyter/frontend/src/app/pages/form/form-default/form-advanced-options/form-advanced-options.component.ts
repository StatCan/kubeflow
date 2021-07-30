import { Component, OnInit, Input} from "@angular/core";
import {FormBuilder, FormControl, FormGroup } from "@angular/forms";
import {TranslateService} from "@ngx-translate/core";
@Component({
  selector: "app-form-advanced-options",
  templateUrl: "./form-advanced-options.component.html",
  styleUrls: [
    "./form-advanced-options.component.scss"
  ]
})
export class FormAdvancedOptionsComponent implements OnInit{
  @Input() parentForm: FormGroup;
  languageList = [
    {'id':'en', 'label':'jupyter.formAdvancedOptions.lblEnglish'},
    {'id':'fr', 'label':'jupyter.formAdvancedOptions.lblFrench'}    
  ];
  constructor(private translate: TranslateService, private fb: FormBuilder) {
    this.parentForm = this.fb.group({
      language: new FormControl(),
      shm: new FormControl()
  });
  }

  ngOnInit() {  
    setTimeout(() => this.parentForm.get('language').setValue(this.translate.defaultLang), 1000)
  }
}
