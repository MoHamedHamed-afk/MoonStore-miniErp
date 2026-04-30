import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFacebookF, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { CartService } from '../../services/cart.service';
import { FavouritesService } from '../../services/favourites.service';
import { Product, ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';
import { TranslationService } from '../../services/translation.service';
import { assetUrl } from '../../core/api.config';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FontAwesomeModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;

  readonly phoneIcon = faPhone;
  readonly facebookIcon = faFacebookF;
  readonly linkedinIcon = faLinkedinIn;
  readonly storeMapsUrl = 'https://maps.app.goo.gl/Y46TNz8Xu1qvK9DT6?g_st=aw';
  readonly storeMapEmbedUrl: SafeResourceUrl;
  readonly carouselImages = [
    'assets/images/male_pose_1.png',
    'assets/images/male_pose_2.png',
    'assets/images/male_pose_3.png',
    'assets/images/female_pose_1.png',
    'assets/images/female_pose_2.png',
    'assets/images/female_pose_3.png'
  ];

  products: Product[] = [];
  summerProducts: Product[] = [];
  winterProducts: Product[] = [];
  searchQuery = '';
  selectedSearchCategory = 'all';
  readonly pageSize = 10;
  winterPage = 1;
  summerPage = 1;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private particles!: THREE.Points;
  private animationFrameId?: number;
  private carouselIntervalId?: ReturnType<typeof setInterval>;
  private resizeHandler = () => this.onWindowResize();
  private ctx?: gsap.Context;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private favService: FavouritesService,
    private router: Router,
    private toastService: ToastService,
    public translation: TranslationService,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.storeMapEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d216.0134054908248!2d32.54770860829238!3d29.97326528609273!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x145625ed2ebcdf9f%3A0xb4a672b73de16a76!2z2YXYudi12LHYqSDYstmH2LHYqSDYp9mE2LPZiNmK2LM!5e0!3m2!1sen!2seg!4v1777424698587!5m2!1sen!2seg'
    );
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loadProducts();
    this.initThreeJs();
    this.initGsap();
  }

  addToCart(product: Product) {
    if (!product.id) {
      return;
    }

    this.cartService.addToCart(product.id).subscribe({
      next: () => this.toastService.show(`${product.name} ${this.translation.t('product.addedToCart')}`, 'success'),
      error: error => this.toastService.show(
        this.cartService.getUserFacingError(error, this.translation.t('product.loginRequired')),
        'error'
      )
    });
  }

  toggleFavorite(product: Product) {
    if (!product.id) {
      return;
    }

    this.favService.toggleFavorite(product.id).subscribe({
      next: () => this.toastService.show(this.translation.t('product.updatedFavourites'), 'success'),
      error: () => this.toastService.show(this.translation.t('product.loginRequired'), 'error')
    });
  }

  isFavorite(productId: number): boolean {
    return this.favService.isFavorite(productId);
  }

  showDetails(productId: number) {
    this.router.navigate(['/product', productId]);
  }

  handleProductCardKeydown(event: KeyboardEvent, productId: number) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.showDetails(productId);
    }
  }

  trackByProductId(_: number, product: Product): number | undefined {
    return product.id;
  }

  trackByValue(_: number, value: string): string {
    return value;
  }

  get searchPlaceholder(): string {
    return this.translation.isArabic ? 'ابحث عن منتج، لون، أو تصنيف' : 'Search products, colors, or categories';
  }

  get searchTitle(): string {
    return this.translation.isArabic ? 'اعثر على قطعتك بسرعة' : 'Find your fit faster';
  }

  get searchSubtitle(): string {
    return this.translation.isArabic
      ? 'ابحث بالاسم أو التصنيف وشاهد النتائج فوراً بدون مغادرة الصفحة.'
      : 'Search by name, category, or description and preview matching pieces instantly.';
  }

  get clearSearchLabel(): string {
    return this.translation.isArabic ? 'مسح' : 'Clear';
  }

  get allCategoriesLabel(): string {
    return this.translation.isArabic ? 'الكل' : 'All';
  }

  get noSearchResultsLabel(): string {
    return this.translation.isArabic ? 'لا توجد منتجات مطابقة حالياً.' : 'No matching products right now.';
  }

  get locationEyebrow(): string {
    return this.translation.isArabic ? 'موقع الفرع' : 'Store location';
  }

  get locationTitle(): string {
    return this.translation.isArabic ? 'زور Moon Store على الخريطة' : 'Visit Moon Store on the map';
  }

  get locationSubtitle(): string {
    return this.translation.isArabic
      ? 'افتح الموقع مباشرة على Google Maps للوصول للفرع بسهولة.'
      : 'Open the exact location in Google Maps and get directions to the branch.';
  }

  get locationActionLabel(): string {
    return this.translation.isArabic ? 'افتح الاتجاهات' : 'Open directions';
  }

  get categoryOptions(): string[] {
    return Array.from(new Set(
      this.products
        .map(product => product.category?.trim())
        .filter((category): category is string => Boolean(category))
    ));
  }

  get isSearchActive(): boolean {
    return this.searchQuery.trim().length > 0 || this.selectedSearchCategory !== 'all';
  }

  get filteredSearchProducts(): Product[] {
    const query = this.searchQuery.trim().toLowerCase();
    const category = this.selectedSearchCategory.toLowerCase();

    return this.products.filter(product => {
      const matchesCategory = this.selectedSearchCategory === 'all'
        || (product.category || '').toLowerCase() === category;
      const searchableText = [
        product.name,
        product.description,
        product.category,
        ...(product.sizes || []),
        ...(product.colors || [])
      ].join(' ').toLowerCase();
      const matchesQuery = !query || searchableText.includes(query);

      return matchesCategory && matchesQuery;
    });
  }

  get paginatedWinterProducts(): Product[] {
    return this.paginate(this.winterProducts, this.winterPage);
  }

  get paginatedSummerProducts(): Product[] {
    return this.paginate(this.summerProducts, this.summerPage);
  }

  get winterPageCount(): number {
    return this.getPageCount(this.winterProducts.length);
  }

  get summerPageCount(): number {
    return this.getPageCount(this.summerProducts.length);
  }

  get paginationLabel(): string {
    return this.translation.isArabic ? 'صفحة' : 'Page';
  }

  get previousPageLabel(): string {
    return this.translation.isArabic ? 'السابق' : 'Previous';
  }

  get nextPageLabel(): string {
    return this.translation.isArabic ? 'التالي' : 'Next';
  }

  changeCollectionPage(collection: 'winter' | 'summer', direction: number) {
    if (collection === 'winter') {
      this.winterPage = this.clampPage(this.winterPage + direction, this.winterPageCount);
      return;
    }

    this.summerPage = this.clampPage(this.summerPage + direction, this.summerPageCount);
  }

  selectSearchCategory(category: string) {
    this.selectedSearchCategory = category;
  }

  clearSearch() {
    this.searchQuery = '';
    this.selectedSearchCategory = 'all';
  }

  getImgUrl(url: string | undefined): string {
    if (!url) {
      return 'assets/images/placeholder.png';
    }

    if (url.startsWith('http') || url.startsWith('assets/')) {
      return url;
    }

    return assetUrl(url);
  }

  private loadProducts() {
    this.productService.getProducts().subscribe({
      next: products => {
        this.products = products.length > 0 ? products : this.getFallbackProducts();
        this.splitCollections();
      },
      error: () => {
        this.products = this.getFallbackProducts();
        this.splitCollections();
      }
    });
  }

  private splitCollections() {
    this.winterProducts = this.products.filter(product => product.category?.toLowerCase() === 'winter');
    this.summerProducts = this.products.filter(product => product.category?.toLowerCase() === 'summer');
    this.winterPage = this.clampPage(this.winterPage, this.winterPageCount);
    this.summerPage = this.clampPage(this.summerPage, this.summerPageCount);
  }

  private paginate<T>(items: T[], page: number): T[] {
    const safePage = this.clampPage(page, this.getPageCount(items.length));
    const start = (safePage - 1) * this.pageSize;
    return items.slice(start, start + this.pageSize);
  }

  private getPageCount(totalItems: number): number {
    return Math.max(1, Math.ceil(totalItems / this.pageSize));
  }

  private clampPage(page: number, pageCount: number): number {
    return Math.min(Math.max(page, 1), pageCount);
  }

  private getFallbackProducts(): Product[] {
    return [
      { id: 1, name: 'Premium 3D Hoodie', description: 'Trendy streetwear hoodie floating in mid-air.', price: 120, imageUrl: 'assets/images/premium_3d_hoodie.png', category: 'Winter' },
      { id: 2, name: 'Futuristic Sneakers', description: 'A pair of premium, futuristic trendy sneakers.', price: 250, imageUrl: 'assets/images/premium_3d_sneakers.png', category: 'Summer' },
      { id: 3, name: 'Modern Puffer Jacket', description: 'Premium, stylish modern jacket or puffer coat.', price: 340, imageUrl: 'assets/images/premium_3d_jacket.png', category: 'Winter' },
      { id: 4, name: 'Summer Vintage Shirt', description: 'Lightweight vintage-style summer shirt.', price: 65, imageUrl: 'assets/images/placeholder.png', category: 'Summer' },
      { id: 5, name: 'Cargo Shorts', description: 'Premium streetwear cargo shorts.', price: 90, imageUrl: 'assets/images/placeholder.png', category: 'Summer' },
      { id: 6, name: 'Streetwear Bucket Hat', description: 'Trendy summer bucket hat.', price: 45, imageUrl: 'assets/images/placeholder.png', category: 'Summer' },
      { id: 7, name: 'Winter Knit Beanie', description: 'Warm winter knit beanie cap.', price: 35, imageUrl: 'assets/images/placeholder.png', category: 'Winter' },
      { id: 8, name: 'Tactical Winter Boots', description: 'Heavy duty tactical winter boots.', price: 210, imageUrl: 'assets/images/placeholder.png', category: 'Winter' },
      { id: 9, name: 'Designer Scarf', description: 'Premium soft designer scarf.', price: 110, imageUrl: 'assets/images/placeholder.png', category: 'Winter' }
    ];
  }

  private initThreeJs() {
    const container = this.canvasContainer.nativeElement as HTMLElement;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1 : 1.35));
    container.appendChild(this.renderer.domElement);

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = window.innerWidth < 768 ? 170 : 320;
    const positions = new Float32Array(particleCount * 3);

    for (let index = 0; index < positions.length; index++) {
      positions[index] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starTexture = this.createStarTexture();
    const material = new THREE.PointsMaterial({
      size: window.innerWidth < 768 ? 0.065 : 0.075,
      color: 0x9b8ec7,
      map: starTexture,
      alphaMap: starTexture,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(particlesGeometry, material);
    this.scene.add(this.particles);

    let lastRenderTime = 0;
    const frameInterval = 1000 / 24;

    const animate = (time = 0) => {
      this.animationFrameId = requestAnimationFrame(animate);
      if (time - lastRenderTime < frameInterval) {
        return;
      }

      lastRenderTime = time;
      this.particles.rotation.y += 0.00028;
      this.particles.rotation.x += 0.00012;

      const isDark = document.body.classList.contains('dark');
      (this.particles.material as THREE.PointsMaterial).color.setHex(isDark ? 0x9b8ec7 : 0x222222);

      this.renderer.render(this.scene, this.camera);
    };

    animate();
    window.addEventListener('resize', this.resizeHandler);
  }

  private initGsap() {
    this.ctx = gsap.context(() => {
      gsap.from('.hero-copy', {
        x: -100,
        opacity: 0,
        duration: 1.5,
        ease: 'power4.out',
        delay: 0.2
      });

      const images = document.querySelectorAll('.carousel-img');
      let currentIndex = 0;

      const cycleCarousel = () => {
        const current = images[currentIndex];
        currentIndex = (currentIndex + 1) % images.length;
        const next = images[currentIndex];

        gsap.timeline()
          .to(current, {
            opacity: 0,
            rotationY: 90,
            scale: 0.8,
            duration: 1.2,
            ease: 'power3.inOut'
          })
          .to(next, {
            opacity: 1,
            rotationY: 0,
            scale: 1,
            duration: 1.2,
            ease: 'power3.inOut'
          }, '<');
      };

      setTimeout(() => {
        this.carouselIntervalId = setInterval(cycleCarousel, 4000);
      }, 3000);

      document.querySelectorAll('section').forEach(section => {
        gsap.from(section, {
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none none'
          },
          opacity: 0,
          y: 50,
          duration: 1,
          ease: 'power3.out'
        });
      });

      document.querySelectorAll('.product-card').forEach((card, index) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none none'
          },
          opacity: 0,
          y: 30,
          scale: 0.9,
          duration: 0.8,
          delay: (index % 3) * 0.1,
          ease: 'power3.out'
        });
      });
    });
  }

  private createStarTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');

    if (context) {
      const gradient = context.createRadialGradient(32, 32, 2, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.35, 'rgba(210, 198, 255, 0.95)');
      gradient.addColorStop(0.7, 'rgba(155, 142, 199, 0.4)');
      gradient.addColorStop(1, 'rgba(155, 142, 199, 0)');
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(32, 32, 32, 0, Math.PI * 2);
      context.fill();
    }

    return new THREE.CanvasTexture(canvas);
  }

  private onWindowResize() {
    if (!this.camera || !this.renderer) {
      return;
    }

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  ngOnDestroy() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.carouselIntervalId) {
      clearInterval(this.carouselIntervalId);
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    window.removeEventListener('resize', this.resizeHandler);
    this.ctx?.revert();
  }
}
