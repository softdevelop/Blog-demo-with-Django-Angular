import { Component, OnInit } from '@angular/core';
import { AlertService, AuthenticationService } from '../_services/index';
import { Router } from '@angular/router';
// import {  AppSettings } from '../app.setting';

@Component({
	// moduleId: module.id,
	selector: 'app-singup',
	templateUrl: './singup.component.html',
	styleUrls: ['./singup.component.css']
})
export class SingupComponent implements OnInit {

	model: any = {};
    loading = false;

    constructor(
        private router: Router,
        private AuthenticationService: AuthenticationService,
        private alertService: AlertService) { }


    ngOnInit() {
	}

    register() {
        this.loading = true;
        this.AuthenticationService.signup(this.model.firstName , this.model.lastName, this.model.username, this.model.password)
            .subscribe(
                data => {
                    let reponse = data.json();
                    if(reponse.result > 0){
                        this.alertService.success(reponse.message, true);
                        this.router.navigate(['/login']);
                    }else{
                        this.alertService.error(reponse.message, true);
                    }
                    this.loading = false;                   
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }

}
