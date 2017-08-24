import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
import { AppSettings } from '../../app.setting';
import { AuthenticationService, SnackBarService, UserService, NotificationService } from '../../_services/index';
import { FileUploader } from 'ng2-file-upload';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';


@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
	cookie : any;
	profiles = this.cookie;
	url_image : string = AppSettings.URL_IMAGE_PROFILE;
	public uploader:FileUploader;
	public image_preview: SafeUrl;
	listRoles = [];
	constructor(
		private authentication : AuthenticationService,
		// private router: Router,
		private snackBar:SnackBarService,
		private sanitizer: DomSanitizer,
		private userService : UserService,
		private notificationService : NotificationService,
		) {
		this.userService.getUsers().subscribe((value) => {
	    	this.cookie = value;
		}); 
	}

	ngOnInit() {
		this.uploader = new FileUploader({url: '/api/profile/edit'});
		this.uploader.onAfterAddingFile = (fileItem) => {
          this.image_preview  = this.sanitizer.bypassSecurityTrustUrl((window.URL.createObjectURL(fileItem._file)));
        }
		this.get_profile();
		this.list_role();
	}
	
	edit_profile(){
		this.profiles.file = '';
		if(this.uploader.queue.length > 0) {
			this.profiles.file = this.uploader.queue[0]._file;
		}
		this.notificationService.edit_profile(this.profiles ,this.cookie)
		.subscribe(
			data => {
				let response =  data.json();
				if(response.result > 0){
					this.get_profile(true);
				}
				this.snackBar.open(response.message);
			},
			error => {
				this.snackBar.open(error.message);
			});

		// let check_upload_img = this.uploader.getNotUploadedItems().length;
		// if(!check_upload_img){
		// 	this.uploader.onBuildItemForm = (item, form) => {
		// 		form.append('token', this.profiles.token);
		// 		form.append('first_name', this.profiles.firstName);
		// 		form.append('last_name', this.profiles.lastName);
		// 		form.append('info', this.profiles.info);
		// 		form.append('email', this.profiles.email);
		// 	};
		// 	this.uploader.uploadAll();
		// 	this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
		// 		var response = JSON.parse(response);
		// 		if(response.result > 0){
		// 			this.get_profile();
		// 			this.authentication.set_cookie(this.profiles);
		// 		}
		// 		this.snackBar.open(response.message);
		// 	};
		// }
	}
	get_profile(cookie : boolean = false){
		this.authentication.get_profile(this.cookie)
		.subscribe(
			data => {
				let response =  data.json();
				if(response.result > 0){
					this.profiles = response.data;
					if(cookie){
						this.authentication.set_cookie(this.profiles);
					}	
				}else{
					this.snackBar.open(response.message);
				}
			},
			error => {
				this.snackBar.open(error.message);
			});
	}


	list_role(){
		this.authentication.list_role()
		.subscribe(
			data => {
				let response =  data.json();
				if(response.result > 0){
					this.listRoles = response.data;
				}else{
					this.snackBar.open(response.message);
				}
			},
			error => {
				this.snackBar.open(error.message);
			});
	}
} 
