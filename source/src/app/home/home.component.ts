import { Component, OnInit } from '@angular/core';
import { AlertService, BlogService, UserService } from '../_services/index';
import { AppSettings } from '../app.setting';
import { User } from '../_models/index';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
	cookie : User[];
	blogs : any = [];
	blogsInfo : any = {};
	page = {
		itemsPerPage : 8,
		page: 1
	};
	url_image_blog_default : string = AppSettings.URL_IMAGE_BLOG_DEFAULT;
	constructor(
		private blogService : BlogService,
		private alertService: AlertService,
		private userService : UserService,
	) { 
		this.userService.getUsers().subscribe((value) => {
	    	this.cookie = value;
		});
	}

	ngOnInit() {
		this.list_blog(this.page);
	}
 
	list_blog(page){
		this.blogService.list_all(page)
		.subscribe(
			data => {
				let response =  data.json();
				if(response.result > 0){
					this.blogsInfo = response.info;
					this.blogs = this.addListBlog(this.blogs, response.data);
				}else{
					this.alertService.error(response.message); 
				}
			},
			error => {
				this.alertService.error(error.message);
			});
		
	}

	addListBlog(list, dataNew){
		  	//dataNew.forEach((value, key) => {
		  	for (let key in dataNew) {
			    list.push(dataNew[key]);
			};
		return list;
	}


	pageChanged(e){
		this.page = e;
		this.list_blog(e);
	}

	onScrollBlog(page){
		if(this.blogsInfo.next_page_number){
			this.page.page = page.page + 1;
			this.list_blog(this.page);
		}
	}
}
