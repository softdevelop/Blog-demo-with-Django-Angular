import { Component, OnInit } from '@angular/core';
// import { Router, } from '@angular/router';
import { AlertService, BlogService, UserService } from '../_services/index';
import { AppSettings } from '../app.setting';
import { ConfirmDelete } from '../_directives/index';
import { MdDialog } from '@angular/material';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
	blogs : any = [];
	cookie :any;
	page = {
		itemsPerPage : 10,
		page: 1
	};

	url_image_blog_default : string = AppSettings.URL_IMAGE_BLOG_DEFAULT;
	
	constructor(
		private blogService : BlogService,
		private alertService: AlertService,
		public dialog: MdDialog,
		private userService : UserService,
		) { 
		this.userService.getUsers().subscribe((value) => {
	    	this.cookie = value;
		});
	}

	ngOnInit() {
		this.list_blog(this.page);
	}

	pageChanged(e){
		this.page = e;
		this.list_blog(e);
	}

	list_blog(page){
		console.log(page)
		this.blogService.list(this.cookie, page)
		.subscribe(
			data => {
				let response =  data.json();
				if(response.result > 0){
					this.blogs = response;
				}else{
					this.alertService.error(response.message); 
				}
			},
			error => {
				// console.log(error.message);
				this.alertService.error(error.message);
			});
		
	}

	openDelete(id: number) {
		let dialogRef = this.dialog.open(ConfirmDelete);
		dialogRef.afterClosed().subscribe(result => {
			if(result) {
				this.blogService.delete(id, this.cookie)
				.subscribe(
					data => {
						let response =  data.json();
						if(response.result > 0){
							this.list_blog(this.page);
							this.alertService.success(response.message);
						}else{
							this.alertService.error(response.message); 
						}
					},
					error => {
						this.alertService.error(error.message);
					});
			}
		});
	}

}
