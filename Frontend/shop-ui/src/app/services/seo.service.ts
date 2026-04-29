import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly fallbackTitle = 'Moon Store | Premium Streetwear Collection';
  private readonly fallbackDescription = 'Shop premium streetwear, hoodies, sneakers, and seasonal collections at Moon Store.';

  constructor(
    private router: Router,
    private title: Title,
    private meta: Meta
  ) {}

  watchRouteChanges(): void {
    this.applyRouteMeta(this.router.routerState.snapshot.root);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.applyRouteMeta(this.router.routerState.snapshot.root));
  }

  private applyRouteMeta(route: ActivatedRouteSnapshot): void {
    let deepest = route;
    while (deepest.firstChild) {
      deepest = deepest.firstChild;
    }

    const title = deepest.title || this.fallbackTitle;
    const description = typeof deepest.data['description'] === 'string'
      ? deepest.data['description']
      : this.fallbackDescription;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
  }
}
