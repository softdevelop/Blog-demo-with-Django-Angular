import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService, SnackBarService } from '../../../_services/index';
import { AppSettings } from '../../../app.setting';
import { FileUploader } from 'ng2-file-upload';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';


@Component({
	selector: 'app-blog-add',
	templateUrl: './blog-add.component.html',
	styleUrls: ['./blog-add.component.css']
})
export class BlogAddComponent implements OnInit {
	blog: any = {};
	cookie :any;
	url_image : string;
	public uploader:FileUploader;
	public image_preview: SafeUrl;


	constructor(  
		// private blogService : BlogService,
		// private alertService: AlertService,
		private router: Router,
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
		this.uploader = new FileUploader({url: '/api/blog/add'});
		this.uploader.onAfterAddingFile = (fileItem) => {
          this.image_preview  = this.sanitizer.bypassSecurityTrustUrl((window.URL.createObjectURL(fileItem._file)));
        }
	}


	add_blog(){
		this.uploader.onBuildItemForm = (item, form) => {
			console.log(item);
			form.append('token', this.cookie.token);
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
		
	}
}
