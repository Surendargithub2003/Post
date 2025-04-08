import {Component, OnDestroy, OnInit} from "@angular/core"
import { AuthService } from "../auth/auth.service"
import { Subscription } from "rxjs"

@Component({
    selector : 'app-header',
    templateUrl : './header.component.html',
    styleUrl : './header.component.css',
    standalone : false
})

export class HeaderComponent implements OnInit , OnDestroy{
    userIsAutenticated = false;
    authListenerSubs : Subscription | undefined;
    constructor(private authService : AuthService){}

    ngOnInit(){
        this.userIsAutenticated = this.authService.getIsAuth();
        this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(
            isAuthenticated =>{
                this.userIsAutenticated = isAuthenticated;
            }
        );
    }

    onLogout() {
        this.authService.logout();
    }

    ngOnDestroy() {
        this.authListenerSubs?.unsubscribe();
    }
}
