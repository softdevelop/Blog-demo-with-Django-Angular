import { Component } from '@angular/core';

import { AlertService } from '../_services/index';

@Component({
	// moduleId: module.id,
	selector: 'alert',
	templateUrl: '../_directives/alert.component.html'
})

export class AlertComponent {
	message: any;

	constructor(private alertService: AlertService) { }

	ngOnInit() {
		this.alertService.getMessage().subscribe(message => { 
			this.message = message; 
			setTimeout(() => {  
				this.message = null;
			}, 5000);
		});
	}
}