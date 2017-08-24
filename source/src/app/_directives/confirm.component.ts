import { Component } from '@angular/core';

import {MdDialogRef} from '@angular/material';

@Component({
	selector: 'dialog-result-example-dialog',
	templateUrl: './confirm.component.html',
})
export class ConfirmDelete {
	constructor(public confirmDelete: MdDialogRef<ConfirmDelete>) {}
}