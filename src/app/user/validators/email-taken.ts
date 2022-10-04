import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AsyncValidator, AbstractControl, ValidationErrors } from "@angular/forms";
import { Injectable } from "@angular/core";


@Injectable({
    providedIn: 'root'
})
export class EmailTaken implements AsyncValidator{
    constructor(private auth: AngularFireAuth) { }

    validate = (control: AbstractControl) : Promise<ValidationErrors | null> => {
        return this.auth.fetchSignInMethodsForEmail(control.value).then(
           response => response.length ? {emailTaken: true} : null 
        )
    }
}
