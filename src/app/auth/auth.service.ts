import { HttpClient } from "@angular/common/http";
import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { AuthData } from "./auth-data.model.js";
import { Subject } from "rxjs";
import { Router } from "@angular/router";
import { isPlatformBrowser } from "@angular/common";
import { environment } from '../../environments/environment.js';

const BACKEND_URL = environment.apiUrl + '/user/';

@Injectable({ providedIn: "root" })
export class AuthService {
  private isAuthenticated = false;
  private token: string = "";
  private tokenTimer: any;
  private userId: string = "";
  private authStatusListener = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  getToken() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem("token");
      console.log("Token from AuthService:", token);
      return token ? token : "";
    }
    return "";
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    return this.http.post(BACKEND_URL + "/signup", authData).subscribe(
      () => {
        this.router.navigate(["/"]);
      },
      (error) => {
        this.authStatusListener.next(false);
      }
    );
  }

  login(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.http
      .post<{ token: string; expiresIn: number; userId: string }>(
        BACKEND_URL + "/login",
        authData
      )
      .subscribe({
        next: (response) => {
          const token = response.token;
          this.token = token;
          if (token) {
            const expiresInDuration = response.expiresIn;
            this.setAuthTimer(expiresInDuration);
            console.log("Token Expires In:", expiresInDuration);

            this.isAuthenticated = true;
            this.userId = response.userId;
            this.authStatusListener.next(true);

            const now = new Date();
            const expirationDate = new Date(
              now.getTime() + expiresInDuration * 1000
            );

            if (isPlatformBrowser(this.platformId)) {
              this.saveAuthData(token, expirationDate, this.userId);
            }

            this.router.navigate(["/"]);
          }
        },
        error: (error) => {
          this.authStatusListener.next(false);
          console.error("Login failed:", error);
        },
      });
  }

  autoAuthUser() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }

    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();

    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId ?? "";
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    } else {
      this.logout();
    }
  }

  logout() {
    this.token = "";
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userId = "";
    if (isPlatformBrowser(this.platformId)) {
      this.clearAuthData();
    }
    clearTimeout(this.tokenTimer);
    this.router.navigate(["/"]);
  }

  private setAuthTimer(duration: number) {
    console.log("Setting timer for:", duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem("token", token);
      localStorage.setItem("expiration", expirationDate.toISOString());
      localStorage.setItem("userId", userId);
    }
  }

  private clearAuthData() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem("token");
      localStorage.removeItem("expiration");
      localStorage.removeItem("userId");
    }
  }

  private getAuthData() {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    const userId = localStorage.getItem("userId");
    if (!token || !expirationDate) {
      return null;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId,
    };
  }
}
