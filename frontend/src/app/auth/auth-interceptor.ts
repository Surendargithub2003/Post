import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { AuthService } from "./auth.service";
import { Injectable } from "@angular/core";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        console.log("AuthInterceptor is running!"); // Add this line
        const authToken = this.authService.getToken();
        console.log("Token in Interceptor:", authToken); // Add this line
        const authRequest = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${authToken}`),
        });
        console.log("Headers that are being sent: ", authRequest.headers);
        return next.handle(authRequest);
    }
}