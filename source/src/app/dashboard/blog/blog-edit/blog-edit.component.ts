import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, BlogService, UserService, SnackBarService } from '../../../_services/index';
import { AppSettings } from '../../../app.setting';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FileUploader } from 'ng2-file-upload';

@Component({
	selector: 'app-blog-edit',
	templateUrl: './blog-edit.component.html',
	styleUrls: ['./blog-edit.component.css']
})
export class BlogEditComponent implements OnInit {
	blog: any = {};
	cookie :any;
	param : string;
	showForm : boolean = false;
	url_image : string;
	public image_preview: SafeUrl;
	public uploader:FileUploader;
	constructor(
		private blogService : BlogService,
		private alertService: AlertService,
		private router: Router,
		private route: ActivatedRoute,
		private userService : UserService,
		private sanitizer: DomSanitizer,
		private snackBar:SnackBarService,
		) { 
		this.userService.getUsers().subscribe((value) => {
	    	this.cookie = value;
		});
		this.url_image = AppSettings.URL_IMAGE_BLOG + this.cookie.id + '/';
	}

	ngOnInit() {
		this.route.params.subscribe(params => {
			this.param = params['id'];
			this.get_blog(this.param);
		});
		this.uploader = new FileUploader({url: '/api/blog/edit'});
		this.uploader.onAfterAddingFile = (fileItem) => {
          this.image_preview  = this.sanitizer.bypassSecurityTrustUrl((window.URL.createObjectURL(fileItem._file)));
        }
	}

	edit_blog(){
		if(this.uploader.queue.length > 0){
			this.uploader.onBuildItemForm = (item, form) => {
				console.log(item);
				form.append('token', this.cookie.token);
		        form.append('id', this.blog.id);
		        form.append('title', this.blog.title);
		        form.append('content_short', this.blog.content_short);
		        form.append('content_full', this.blog.content_full);
			};
			this.uploader.uploadAll();
			this.uploader.onCompleteItem = (item: any, response: any) => {
				console.log(item);
				var response = JSON.parse(response);
				if(response.result > 0){
					this.router.navigate(['/dashboard']);
				}
				this.snackBar.open(response.message);
			};
		}else{
			this.blogService.edit(this.blog, this.cookie)
			.subscribe(
				data => {
					let response =  data.json();
					if(response.result > 0){
						this.router.navigate(['/dashboard']);
					}
					this.snackBar.open(response.message);
				},
				error => {
					this.snackBar.open(error.message);
				});
		}
	}

	get_blog(id){
		this.blogService.get(this.cookie, id)
		.subscribe(
			data => {
				let response =  data.json();
				if(response.result > 0){
					if(response.data.created_by === this.cookie.userName) {
						this.showForm  = true;
						this.blog = response.data;
					}else{
						this.alertService.error('403'); 	
					}
				}else{
					this.alertService.error(response.message); 
				}
			},
			error => {
				// console.log(error.message);
				this.alertService.error(error.message);
			});
		
	}

}
