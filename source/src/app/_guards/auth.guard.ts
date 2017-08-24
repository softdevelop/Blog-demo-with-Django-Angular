import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppSettings } from '../app.setting';

@Injectable()
export class AuthGuard implements CanActivate {
    cookie : any;
    constructor(private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        this.cookie = localStorage.getItem(AppSettings.COOKIE_USERS);
        if (this.cookie) {
            let roles = route.data["roles"] as Array<string>;
            let cookie_obj = JSON.parse(localStorage.getItem(AppSettings.COOKIE_USERS));
            if(roles){
                let result = (roles == null || roles.indexOf(cookie_obj.roles) != -1);
                if(!result) {
                    this.router.navigate(['/']);
                }
                return result;
            }else{
                return true;
            }
            
        }

        // not logged in so redirect to login page with the return url
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
        return false;
    }
}