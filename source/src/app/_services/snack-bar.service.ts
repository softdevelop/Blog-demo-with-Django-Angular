import { Injectable } from '@angular/core';
// import { Router, NavigationStart } from '@angular/router';
// import { Observable } from 'rxjs';
// import { Subject } from 'rxjs/Subject';
import {MdSnackBar} from '@angular/material';


@Injectable()
export class SnackBarService {
    // private subject = new Subject<any>();
    // private keepAfterNavigationChange = false;

    constructor(public snackBar: MdSnackBar) {}

    open(message: string, action: string = '') {
        this.snackBar.open(message, action, {
            duration: 5000,
        });
    }
}