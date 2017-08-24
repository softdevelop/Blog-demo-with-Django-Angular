import { Component, OnInit, Inject } from '@angular/core';
import { AlertService, BlogService, SnackBarService, UserService, ChatService } from '../_services/index';
import { AppSettings } from '../app.setting';
import { Router, ActivatedRoute } from '@angular/router';
import { Title }     from '@angular/platform-browser';

import { ConfirmDelete } from '../_directives/index';
import { MdDialog } from '@angular/material';

import { FormGroup} from '@angular/forms';
// import { User } from '../_models/index';


import {PageScrollInstance, PageScrollService} from 'ng2-page-scroll';
import {DOCUMENT} from '@angular/platform-browser';

@Component({
	selector: 'app-blog',
	templateUrl: './blog.component.html',
	styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit {
	blog: any;
	cookie : any;
	param : string;
	fragment : string;
	disable_like : boolean = true;
	url_image : string = AppSettings.URL_IMAGE_PROFILE;
	url_image_blog_default : string = AppSettings.URL_IMAGE_BLOG_DEFAULT;
	url_image_avatar_default : string = AppSettings.URL_IMAGE_AVATAR_DEFAULT;


	show_from_reply : number =  0;

	comments : string;
	comments_loading:boolean = false;
	comments_list : any = [];
	page = {
		itemsPerPage : 5,
		page: 1
	};


	constructor(
		private blogService : BlogService,
		private alertService: AlertService,
		private router: Router,
		private route: ActivatedRoute,
		private titleService:Title, 
		private snackBar:SnackBarService,
		public dialog: MdDialog,
		private userService : UserService,
		private pageScrollService: PageScrollService, 
		@Inject(DOCUMENT) private document: any,
		private chatService: ChatService, 
		) { 
		this.userService.getUsers().subscribe((value) => {
			this.cookie = value;
		});
	}

	ngOnInit() {
		this.route.fragment.subscribe(fragment => {
			this.fragment = fragment;
		});
		this.route.params.subscribe(params => {
			this.param = params['id'];
			this.get_blog(this.param);
		});
	}




	like_blog(blog: any){
		if(this.cookie.token){
			this.blogService.like(this.cookie, blog.id)
			.subscribe(
				data => {
					let response =  data.json();
					if(response.result > 0){
						this.disable_like = false;
						this.blog.like += 1;
						this.snackBar.open(response.message);
					}else{
						this.snackBar.open(response.message);
					}
				},
				error => {
					this.snackBar.open(error.message);
				});
		}else{
			this.router.navigate(['/login'], { queryParams: { returnUrl:  this.router.url}});
		}  
	}

	get_blog(id){
		this.blogService.get(this.cookie, id)
		.subscribe(
			data => {
				let response =  data.json();
				if(response.result > 0){
					this.blog = response.data;
					var title = this.blog.title +' | ' +  AppSettings.TITLE_HOST ;
					this.titleService.setTitle(title);
					this.get_comments(this.blog.id, this.page);
				}else{
					this.alertService.error(response.message); 
				}
			},
			error => {
				this.alertService.error(error.message);
			});
	}

	get_comments(id, page){	
		this.blogService.list_comments(id, page)
		.subscribe(
			data => {
				let response =  data.json();
				if(response.result > 0){
					this.comments_list = response;
					this.show_from_reply = 0;

					if(this.fragment){
						// console.log(this.fragment)
						this.goToComment(this.fragment);
					}
				}else{
					this.alertService.error(response.message); 
				}
			},
			error => {
				this.alertService.error(error.message);
			});
	}

	pageChanged(e){
		this.page = e;
		this.get_comments(this.param, e);
	}


	goToComment(param : string) {
		setTimeout(() => {
			let pageScrollInstance: PageScrollInstance = PageScrollInstance.simpleInstance(this.document, '#' + param);
			this.pageScrollService.start(pageScrollInstance);
		}, 1000);
	}


	delete_comment(id){
		let dialogRef = this.dialog.open(ConfirmDelete);
		dialogRef.afterClosed().subscribe(result => {
			if(result) {
				this.blogService.delete_comment(id, this.cookie)
				.subscribe(
					data => {
						let response =  data.json();
						if(response.result > 0){
							this.snackBar.open(response.message);
							this.get_comments(this.param, this.page);
						}else{
							this.snackBar.open(response.message);
						}
					},
					error => {
						this.snackBar.open(error.message);
					});
			}
		});	
	}
	edit_comment(){
		this.snackBar.open('Try last');
	}

	comment_blog(id, form : FormGroup ){
		if(this.cookie.token){
			this.comments_loading = true;
			this.blogService.comments(this.cookie, id, this.comments)
			.subscribe(
				data => {
					let response =  data.json();
					if(response.result > 0){
						this.comments_loading = false;
						this.snackBar.open(response.message);
						this.get_comments(id, this.page);
						form.reset();
						this.callNoitification(response.data);
						
					}else{
						this.comments_loading = false;
						this.snackBar.open(response.message);
					}
				}, 
				error => {
					this.snackBar.open(error.message);
				});
		}else{
			this.router.navigate(['/login'], { queryParams: { returnUrl:  this.router.url}});
		}
	}

	// reply Comments
	reply_comments : string;
	inputFocusedComment : boolean = false;
	show_reply_comment_form(id){
		this.show_from_reply = id;
		this.inputFocusedComment = true;
	}

	reply_comment_click(blog_id ,comment_id,  form : FormGroup){
		if(this.cookie.token){ 
			this.comments_loading = true;
			this.blogService.comments(this.cookie, blog_id, this.reply_comments, comment_id)
			.subscribe(
				data => {
					let response =  data.json();
					if(response.result > 0){
						this.snackBar.open(response.message);
						this.get_comments(blog_id, this.page);
						form.reset();
						this.callNoitification(response.data);
					}
					this.snackBar.open(response.message);
					this.comments_loading = false;
				},
				error => {
					this.snackBar.open(error.message);
				});
		}else{
			this.router.navigate(['/login'], { queryParams: { returnUrl:  this.router.url}});
		}
	}



	callNoitification(data){
		// send notification WebSocket
		if(Object.keys(data).length > 0){
			let notificationWs = {
				'data' : data
			}
			this.chatService.messages.next(notificationWs);
		}
	}


	delete_blog(id: number) {
		let dialogRef = this.dialog.open(ConfirmDelete);
		dialogRef.afterClosed().subscribe(result => {
			if(result) {
				this.blogService.delete(id, this.cookie)
				.subscribe(
					data => {
						let response =  data.json();
						if(response.result > 0){
							this.alertService.success(response.message);
							this.router.navigate(['/']);
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
