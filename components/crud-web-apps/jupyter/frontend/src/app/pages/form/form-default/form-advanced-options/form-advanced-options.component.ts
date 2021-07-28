import { Component, OnInit, Input } from "@angular/core";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
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
  public modeselect = 'English';

  constructor(private translate: TranslateService, private fb: FormBuilder) {}
  ngOnInit() { 
    // this.parentForm.patchValue({
    //   language: this.parentForm.get('language').setValue(this.translate.defaultLang) 
    // });
    console.log (this.parentForm.get('language'))
    console.log(this.parentForm.get('language').value)
    console.log("LANG:  " + this.translate.defaultLang)
    }

    // ngAfterContentInit(){
    //   console.log (this.parentForm.get('language'))
    //   this.parentForm.get('language').setValue(this.translate.defaultLang) 
    // }

    ngAfterViewInit(){
      this.parentForm.get('language').setValue(this.translate.defaultLang)
    }
}