import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowRotateRight,
  faBan,
  faBoxOpen,
  faChartLine,
  faCheck,
  faCheckCircle,
  faClipboardList,
  faDoorOpen,
  faEdit,
  faGlobe,
  faMoon,
  faSave,
  faStore,
  faSun,
  faTimes,
  faTrash,
  faTruckFast,
  faUserTie
} from '@fortawesome/free-solid-svg-icons';
import { AuthService, ModeratorPayload, User } from '../../services/auth.service';
import { Order, OrderService } from '../../services/order.service';
import { Product, ProductService, Store } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';
import { TranslationService } from '../../services/translation.service';
import { apiUrl, assetUrl } from '../../core/api.config';

type DashboardTab = 'overview' | 'products' | 'orders' | 'moderators';

interface ModeratorAccount {
  id: number;
  username: string;
  email?: string;
  phoneNumber?: string;
  role: string;
  assignedStoreId?: number | null;
  assignedStoreName?: string;
  isActive?: boolean;
}

const dashboardLabels = {
  en: {
    shop: 'Shop',
    logout: 'Logout',
    languageToggle: 'AR',
    themeLight: 'Light',
    themeDark: 'Dark',
    moderatorTitle: 'Branch Orders Dashboard',
    adminTitle: 'Selling Operations',
    moderatorSubtitle: 'Manage only the orders assigned to your branch without full admin access.',
    adminSubtitle: 'A simple dashboard for products, orders, and branch moderators.',
    overview: 'Overview',
    products: 'Products',
    orders: 'Orders',
    moderators: 'Moderators',
    totalProducts: 'Products',
    pendingOrders: 'Pending Orders',
    completedOrders: 'Completed Orders',
    stores: 'Stores',
    editProduct: 'Edit Product',
    addProduct: 'Add Product',
    productName: 'Product Name',
    description: 'Description',
    price: 'Price',
    stock: 'Stock',
    category: 'Category',
    sizes: 'Sizes',
    colors: 'Colors',
    availableStores: 'Available in stores',
    productImage: 'Product Image',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    uncategorized: 'Uncategorized',
    noSizes: 'No sizes',
    noColors: 'No colors',
    noStores: 'No stores',
    edit: 'Edit',
    delete: 'Delete',
    refresh: 'Refresh',
    branchOnlyOrders: 'Only your branch orders appear here.',
    allOrders: 'All orders from all branches.',
    noOrders: 'No orders yet.',
    accept: 'Accept',
    reject: 'Reject',
    completedAction: 'Done',
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    completed: 'Completed',
    editModerator: 'Edit Moderator',
    addModerator: 'Add Moderator',
    username: 'Username',
    password: 'Password',
    passwordHint: 'Leave empty to keep unchanged',
    passwordNew: 'Password',
    email: 'Email',
    phone: 'Phone',
    store: 'Store',
    activeAccount: 'Account is active',
    saveModerator: 'Save Moderator',
    active: 'Active',
    inactive: 'Inactive',
    noEmail: 'No email',
    deactivate: 'Deactivate',
    searchProducts: 'Search products',
    searchOrders: 'Search orders',
    orderStatus: 'Order status',
    allStatuses: 'All statuses',
    allStores: 'All stores',
    noProducts: 'No products match your filters.',
    loadingProducts: 'Loading products...',
    loadingOrders: 'Loading orders...',
    loadingModerators: 'Loading moderators...',
    autoAssignedStore: 'Auto-assigned based on product availability.',
    moderatorStoreScope: 'You only see orders assigned to your store.',
    confirmTitle: 'Please confirm',
    confirmDeleteProduct: 'Delete this product? This action cannot be undone.',
    confirmDeactivateModerator: 'Deactivate this moderator account?',
    keep: 'Keep'
  },
  ar: {
    shop: 'المتجر',
    logout: 'خروج',
    languageToggle: 'EN',
    themeLight: 'فاتح',
    themeDark: 'داكن',
    moderatorTitle: 'لوحة طلبات الفرع',
    adminTitle: 'تشغيل البيع',
    moderatorSubtitle: 'إدارة الطلبات الخاصة بفرعك فقط بدون الوصول لإعدادات الإدارة العامة.',
    adminSubtitle: 'لوحة بسيطة لإدارة المنتجات والطلبات والمودريتورز حسب الفروع.',
    overview: 'نظرة عامة',
    products: 'المنتجات',
    orders: 'الطلبات',
    moderators: 'المودريتورز',
    totalProducts: 'المنتجات',
    pendingOrders: 'طلبات منتظرة',
    completedOrders: 'طلبات مكتملة',
    stores: 'الفروع',
    editProduct: 'تعديل منتج',
    addProduct: 'إضافة منتج',
    productName: 'اسم المنتج',
    description: 'الوصف',
    price: 'السعر',
    stock: 'المخزون',
    category: 'التصنيف',
    sizes: 'المقاسات',
    colors: 'الألوان',
    availableStores: 'متاح في الفروع',
    productImage: 'صورة المنتج',
    saveChanges: 'حفظ التعديل',
    cancel: 'إلغاء',
    uncategorized: 'بدون تصنيف',
    noSizes: 'لا توجد مقاسات',
    noColors: 'لا توجد ألوان',
    noStores: 'لا توجد فروع',
    edit: 'تعديل',
    delete: 'حذف',
    refresh: 'تحديث',
    branchOnlyOrders: 'تظهر هنا طلبات فرعك فقط.',
    allOrders: 'كل الطلبات من كل الفروع.',
    noOrders: 'لا توجد طلبات حالياً.',
    accept: 'قبول',
    reject: 'رفض',
    completedAction: 'تم',
    pending: 'منتظر',
    accepted: 'مقبول',
    rejected: 'مرفوض',
    completed: 'مكتمل',
    editModerator: 'تعديل مودريتور',
    addModerator: 'إضافة مودريتور',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    passwordHint: 'اتركها فارغة بدون تغيير',
    passwordNew: 'كلمة المرور',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    store: 'الفرع',
    activeAccount: 'الحساب نشط',
    saveModerator: 'حفظ المودريتور',
    active: 'نشط',
    inactive: 'غير نشط',
    noEmail: 'لا يوجد بريد',
    deactivate: 'تعطيل',
    searchProducts: 'بحث المنتجات',
    searchOrders: 'بحث الطلبات',
    orderStatus: 'حالة الطلب',
    allStatuses: 'كل الحالات',
    allStores: 'كل الفروع',
    noProducts: 'لا توجد منتجات مطابقة للفلاتر.',
    loadingProducts: 'جاري تحميل المنتجات...',
    loadingOrders: 'جاري تحميل الطلبات...',
    loadingModerators: 'جاري تحميل المودريتورز...',
    autoAssignedStore: 'يتم تحديد الفرع تلقائياً حسب توفر المنتج.',
    moderatorStoreScope: 'أنت ترى طلبات فرعك فقط.',
    confirmTitle: 'تأكيد الإجراء',
    confirmDeleteProduct: 'هل تريد حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.',
    confirmDeactivateModerator: 'هل تريد تعطيل حساب هذا المودريتور؟',
    keep: 'إبقاء'
  }
} as const;

type DashboardLabelKey = keyof typeof dashboardLabels.en;

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FontAwesomeModule],
  template: `
    <div class="admin-shell">
      <div class="admin-backdrop"></div>

      <nav class="glass dashboard-nav">
        <a routerLink="/" class="brand">Moon Store</a>
        <div class="nav-actions">
          <button type="button" routerLink="/" class="ghost-btn"><fa-icon class="btn-icon" [icon]="icons.shop"></fa-icon>{{ label('shop') }}</button>
          <button
            type="button"
            class="ghost-btn compact-control"
            (click)="translation.toggleLanguage()"
            [attr.aria-label]="translation.isArabic ? 'Switch language to English' : 'Switch language to Arabic'">
            <fa-icon class="btn-icon" [icon]="icons.language"></fa-icon>
            <span>{{ label('languageToggle') }}</span>
          </button>
          <button
            type="button"
            class="ghost-btn compact-control"
            (click)="toggleTheme()"
            [attr.aria-label]="isDarkMode ? label('themeLight') : label('themeDark')">
            <fa-icon class="btn-icon" [icon]="isDarkMode ? icons.sun : icons.moon"></fa-icon>
            <span>{{ isDarkMode ? label('themeLight') : label('themeDark') }}</span>
          </button>
          <button type="button" class="ghost-btn danger" (click)="logout()"><fa-icon class="btn-icon" [icon]="icons.logout"></fa-icon>{{ label('logout') }}</button>
        </div>
      </nav>

      <main class="dashboard-container">
        <section class="glass hero-card">
          <div>
            <p class="eyebrow">Phase 1 MVP</p>
            <h1>{{ isModerator ? label('moderatorTitle') : label('adminTitle') }}</h1>
            <p>
              {{ isModerator
                ? label('moderatorSubtitle')
                : label('adminSubtitle') }}
            </p>
          </div>
          <div class="role-pill">
            <span>{{ currentUser?.role }}</span>
            <strong *ngIf="isModerator">Store #{{ currentUser?.assignedStoreId || '-' }}</strong>
          </div>
        </section>

        <section class="tabs" *ngIf="isAdmin">
          <button type="button" [class.active]="activeTab === 'overview'" (click)="setTab('overview')">
            <fa-icon class="nav-icon" [icon]="icons.overview"></fa-icon>{{ label('overview') }}
          </button>
          <button type="button" [class.active]="activeTab === 'products'" (click)="setTab('products')">
            <fa-icon class="nav-icon" [icon]="icons.products"></fa-icon>{{ label('products') }}
          </button>
          <button type="button" [class.active]="activeTab === 'orders'" (click)="setTab('orders')">
            <fa-icon class="nav-icon" [icon]="icons.orders"></fa-icon>{{ label('orders') }}
          </button>
          <button type="button" [class.active]="activeTab === 'moderators'" (click)="setTab('moderators')">
            <fa-icon class="nav-icon" [icon]="icons.moderators"></fa-icon>{{ label('moderators') }}
          </button>
        </section>

        <section class="glass stats-grid" *ngIf="activeTab === 'overview' && isAdmin">
          <article>
            <fa-icon class="stat-icon" [icon]="icons.products"></fa-icon>
            <span>{{ label('totalProducts') }}</span>
            <strong>{{ products.length }}</strong>
          </article>
          <article>
            <fa-icon class="stat-icon" [icon]="icons.pending"></fa-icon>
            <span>{{ label('pendingOrders') }}</span>
            <strong>{{ countOrders('Pending') }}</strong>
          </article>
          <article>
            <fa-icon class="stat-icon" [icon]="icons.completed"></fa-icon>
            <span>{{ label('completedOrders') }}</span>
            <strong>{{ countOrders('Completed') }}</strong>
          </article>
          <article>
            <fa-icon class="stat-icon" [icon]="icons.shop"></fa-icon>
            <span>{{ label('stores') }}</span>
            <strong>{{ stores.length }}</strong>
          </article>
        </section>

        <section class="panel-grid" *ngIf="activeTab === 'products' && isAdmin">
          <form class="glass editor-card" (ngSubmit)="saveProduct()">
            <h2><fa-icon class="section-icon" [icon]="icons.products"></fa-icon>{{ editingProductId ? label('editProduct') : label('addProduct') }}</h2>

            <label>
              {{ label('productName') }}
              <input name="productName" [(ngModel)]="productForm.name" required>
            </label>

            <label>
              {{ label('description') }}
              <textarea name="productDescription" [(ngModel)]="productForm.description" rows="3"></textarea>
            </label>

            <div class="form-row">
              <label>
                {{ label('price') }}
                <input name="productPrice" type="number" min="0" step="0.01" [(ngModel)]="productForm.price" required>
              </label>
              <label>
                {{ label('stock') }}
                <input name="productStock" type="number" min="0" [(ngModel)]="productForm.stockQuantity" required>
              </label>
            </div>

            <label>
              {{ label('category') }}
              <input name="productCategory" [(ngModel)]="productForm.category" placeholder="Hoodies, Shoes...">
            </label>

            <div class="form-row">
              <label>
                {{ label('sizes') }}
                <input name="productSizes" [(ngModel)]="sizesInput" placeholder="S, M, L, XL">
              </label>
              <label>
                {{ label('colors') }}
                <input name="productColors" [(ngModel)]="colorsInput" placeholder="Black, White">
              </label>
            </div>

            <div class="store-picker">
              <span>{{ label('availableStores') }}</span>
              <label *ngFor="let store of stores" class="checkbox-pill">
                <input
                  type="checkbox"
                  [checked]="isStoreSelected(store.id)"
                  (change)="toggleProductStore(store.id)">
                {{ store.name }}
              </label>
            </div>

            <label>
              {{ label('productImage') }}
              <input type="file" accept="image/*" [disabled]="isUploadingImage" (change)="uploadImage($event)">
              <small *ngIf="isUploadingImage">Uploading image...</small>
            </label>

            <img *ngIf="productForm.imageUrl" class="preview-image" [src]="getImgUrl(productForm.imageUrl)" alt="Product preview">

            <div class="button-row">
              <button class="primary-btn" type="submit" [disabled]="isSavingProduct"><fa-icon class="btn-icon" [icon]="icons.save"></fa-icon>{{ isSavingProduct ? 'Saving...' : (editingProductId ? label('saveChanges') : label('addProduct')) }}</button>
              <button class="ghost-btn" type="button" *ngIf="editingProductId" (click)="resetProductForm()"><fa-icon class="btn-icon" [icon]="icons.cancel"></fa-icon>{{ label('cancel') }}</button>
            </div>
          </form>

          <div class="list-stack">
            <div class="glass filter-card">
              <label>
                {{ label('searchProducts') }}
                <input
                  name="productSearch"
                  [(ngModel)]="productSearch"
                  [placeholder]="label('searchProducts')">
              </label>
              <label>
                {{ label('store') }}
                <select name="productStoreFilter" [(ngModel)]="productStoreFilter">
                  <option [ngValue]="0">{{ label('allStores') }}</option>
                  <option *ngFor="let store of stores" [ngValue]="store.id">{{ store.name }}</option>
                </select>
              </label>
            </div>

            <div class="glass empty-card" *ngIf="isLoadingProducts">{{ label('loadingProducts') }}</div>
            <div class="glass empty-card error-card" *ngIf="productsError">{{ productsError }}</div>

            <article class="glass product-row" *ngFor="let product of filteredProducts">
              <img [src]="getImgUrl(product.imageUrl)" [alt]="product.name">
              <div>
                <h3>{{ product.name }}</h3>
                <p>{{ product.category || label('uncategorized') }} · \${{ product.price }} · {{ label('stock') }} {{ product.stockQuantity || 0 }}</p>
                <small>
                  {{ joinList(product.sizes) || label('noSizes') }} ·
                  {{ joinList(product.colors) || label('noColors') }} ·
                  {{ getStoreNames(product.availableStoreIds) }}
                </small>
              </div>
              <div class="row-actions">
                <button type="button" class="ghost-btn" (click)="editProduct(product)"><fa-icon class="btn-icon" [icon]="icons.edit"></fa-icon>{{ label('edit') }}</button>
                <button type="button" class="ghost-btn danger" [disabled]="isDeletingProduct(product.id)" (click)="deleteProduct(product)"><fa-icon class="btn-icon" [icon]="icons.delete"></fa-icon>{{ isDeletingProduct(product.id) ? 'Deleting...' : label('delete') }}</button>
              </div>
            </article>

            <div class="glass empty-card" *ngIf="!isLoadingProducts && !productsError && filteredProducts.length === 0">
              {{ label('noProducts') }}
            </div>
          </div>
        </section>

        <section class="glass orders-panel" *ngIf="activeTab === 'orders'">
          <div class="panel-heading">
            <div>
              <h2><fa-icon class="section-icon" [icon]="icons.orders"></fa-icon>{{ label('orders') }}</h2>
              <p>{{ isModerator ? label('branchOnlyOrders') : label('allOrders') }}</p>
            </div>
            <button type="button" class="ghost-btn" (click)="loadOrders()"><fa-icon class="btn-icon" [icon]="icons.refresh"></fa-icon>{{ label('refresh') }}</button>
          </div>

          <div class="filter-card" *ngIf="!isModerator">
            <label>
              {{ label('searchOrders') }}
              <input name="orderSearch" [(ngModel)]="orderSearch" placeholder="Name, phone, email, order #">
            </label>
            <label>
              {{ label('orderStatus') }}
              <select name="orderStatusFilter" [(ngModel)]="orderStatusFilter">
                <option value="">{{ label('allStatuses') }}</option>
                <option value="Pending">{{ label('pending') }}</option>
                <option value="Accepted">{{ label('accepted') }}</option>
                <option value="Rejected">{{ label('rejected') }}</option>
                <option value="Completed">{{ label('completed') }}</option>
              </select>
            </label>
          </div>

          <div class="empty-card" *ngIf="isLoadingOrders">{{ label('loadingOrders') }}</div>
          <div class="empty-card error-card" *ngIf="ordersError">{{ ordersError }}</div>

          <article class="order-card" *ngFor="let order of filteredOrders">
            <div class="order-top">
              <div>
                <h3>Order #{{ order.id }} · {{ order.customerName }}</h3>
                <p>{{ order.storeName || ('Store #' + order.storeId) }} · {{ order.orderDate | date:'medium' }}</p>
                <p class="hint-line">{{ isModerator ? label('moderatorStoreScope') : label('autoAssignedStore') }}</p>
              </div>
              <span class="status-pill" [ngClass]="statusClass(order.status)">
                <fa-icon class="status-icon" [icon]="statusIcon(order.status)"></fa-icon>{{ statusLabel(order.status) }}
              </span>
            </div>

            <div class="order-items">
              <div *ngFor="let item of order.items">
                <strong>{{ item.productName }}</strong>
                <span>
                  Qty {{ item.quantity }} · \${{ item.unitPrice }}
                  <ng-container *ngIf="item.selectedSize"> · Size {{ item.selectedSize }}</ng-container>
                  <ng-container *ngIf="item.selectedColor"> · Color {{ item.selectedColor }}</ng-container>
                </span>
              </div>
            </div>

            <div class="order-bottom">
              <span>
                {{ order.email }}
                <ng-container *ngIf="order.phoneNumber"> · {{ order.phoneNumber }}</ng-container>
                · {{ order.address }}
                <ng-container *ngIf="order.paymentMethod"> · {{ formatPaymentMethod(order.paymentMethod) }}</ng-container>
              </span>
              <strong>\${{ order.totalAmount }}</strong>
            </div>

            <div class="order-actions">
              <button type="button" class="accept" [disabled]="order.status === 'Accepted' || isUpdatingOrder(order.id)" (click)="updateOrder(order, 'Accepted')"><fa-icon class="btn-icon" [icon]="icons.accept"></fa-icon>{{ label('accept') }}</button>
              <button type="button" class="reject" [disabled]="order.status === 'Rejected' || isUpdatingOrder(order.id)" (click)="updateOrder(order, 'Rejected')"><fa-icon class="btn-icon" [icon]="icons.reject"></fa-icon>{{ label('reject') }}</button>
              <button type="button" class="complete" [disabled]="order.status === 'Completed' || isUpdatingOrder(order.id)" (click)="updateOrder(order, 'Completed')"><fa-icon class="btn-icon" [icon]="icons.completed"></fa-icon>{{ label('completedAction') }}</button>
            </div>
          </article>

          <div class="empty-card" *ngIf="!isLoadingOrders && !ordersError && filteredOrders.length === 0">{{ label('noOrders') }}</div>
        </section>

        <section class="panel-grid" *ngIf="activeTab === 'moderators' && isAdmin">
          <form class="glass editor-card" (ngSubmit)="saveModerator()">
            <h2><fa-icon class="section-icon" [icon]="icons.moderators"></fa-icon>{{ editingModeratorId ? label('editModerator') : label('addModerator') }}</h2>

            <label>
              {{ label('username') }}
              <input name="moderatorUsername" [(ngModel)]="moderatorForm.username" required>
            </label>

            <label>
              {{ label('password') }}
              <input
                name="moderatorPassword"
                type="password"
                [(ngModel)]="moderatorForm.password"
                [required]="!editingModeratorId"
                placeholder="{{ editingModeratorId ? label('passwordHint') : label('passwordNew') }}">
            </label>

            <label>
              {{ label('email') }}
              <input name="moderatorEmail" type="email" [(ngModel)]="moderatorForm.email">
            </label>

            <label>
              {{ label('phone') }}
              <input name="moderatorPhone" [(ngModel)]="moderatorForm.phoneNumber">
            </label>

            <label>
              {{ label('store') }}
              <select name="moderatorStore" [(ngModel)]="moderatorForm.assignedStoreId" required>
                <option *ngFor="let store of stores" [ngValue]="store.id">{{ store.name }}</option>
              </select>
            </label>

            <label class="inline-check">
              <input type="checkbox" name="moderatorActive" [(ngModel)]="moderatorForm.isActive">
              {{ label('activeAccount') }}
            </label>

            <div class="button-row">
              <button class="primary-btn" type="submit"><fa-icon class="btn-icon" [icon]="icons.save"></fa-icon>{{ editingModeratorId ? label('saveModerator') : label('addModerator') }}</button>
              <button class="ghost-btn" type="button" *ngIf="editingModeratorId" (click)="resetModeratorForm()"><fa-icon class="btn-icon" [icon]="icons.cancel"></fa-icon>{{ label('cancel') }}</button>
            </div>
          </form>

          <div class="list-stack">
            <div class="glass empty-card" *ngIf="isLoadingModerators">{{ label('loadingModerators') }}</div>
            <div class="glass empty-card error-card" *ngIf="moderatorsError">{{ moderatorsError }}</div>

            <article class="glass moderator-row" *ngFor="let moderator of moderators">
              <div>
                <h3>{{ moderator.username }}</h3>
                <p>{{ moderator.assignedStoreName || getStoreName(moderator.assignedStoreId) }} · {{ moderator.email || label('noEmail') }}</p>
                <small>{{ moderator.isActive === false ? label('inactive') : label('active') }}</small>
              </div>
              <div class="row-actions">
                <button type="button" class="ghost-btn" (click)="editModerator(moderator)"><fa-icon class="btn-icon" [icon]="icons.edit"></fa-icon>{{ label('edit') }}</button>
                <button type="button" class="ghost-btn danger" (click)="deactivateModerator(moderator)"><fa-icon class="btn-icon" [icon]="icons.deactivate"></fa-icon>{{ label('deactivate') }}</button>
              </div>
            </article>
          </div>
        </section>
      </main>

      <div class="confirm-backdrop" *ngIf="confirmDialog">
        <div class="glass confirm-card" role="dialog" aria-modal="true" [attr.aria-label]="label('confirmTitle')">
          <h3>{{ label('confirmTitle') }}</h3>
          <p>{{ confirmDialog.message }}</p>
          <div class="button-row">
            <button type="button" class="ghost-btn" (click)="closeConfirm()">{{ label('keep') }}</button>
            <button type="button" class="ghost-btn danger" (click)="runConfirmAction()">{{ confirmDialog.confirmLabel }}</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  icons = {
    accept: faCheck,
    cancel: faTimes,
    completed: faCheckCircle,
    deactivate: faBan,
    delete: faTrash,
    edit: faEdit,
    language: faGlobe,
    logout: faDoorOpen,
    moderators: faUserTie,
    moon: faMoon,
    orders: faClipboardList,
    overview: faChartLine,
    pending: faTruckFast,
    products: faBoxOpen,
    refresh: faArrowRotateRight,
    reject: faTimes,
    save: faSave,
    shop: faStore,
    sun: faSun
  };

  currentUser: User | null = null;
  isDarkMode = true;
  activeTab: DashboardTab = 'overview';
  products: Product[] = [];
  orders: Order[] = [];
  stores: Store[] = [];
  moderators: ModeratorAccount[] = [];
  productSearch = '';
  productStoreFilter = 0;
  orderSearch = '';
  orderStatusFilter = '';
  isLoadingProducts = false;
  isLoadingOrders = false;
  isLoadingModerators = false;
  isSavingProduct = false;
  isUploadingImage = false;
  deletingProductIds = new Set<number>();
  updatingOrderIds = new Set<number>();
  productsError = '';
  ordersError = '';
  moderatorsError = '';
  confirmDialog?: { message: string; confirmLabel: string; action: () => void };

  editingProductId?: number;
  sizesInput = 'S, M, L, XL';
  colorsInput = 'Black, White';
  productForm: Product = this.createBlankProduct();

  editingModeratorId?: number;
  moderatorForm: ModeratorPayload = this.createBlankModerator();

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private orderService: OrderService,
    private http: HttpClient,
    private toastService: ToastService,
    private router: Router,
    public translation: TranslationService
  ) {}

  ngOnInit(): void {
    this.isDarkMode = document.body.classList.contains('dark');
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser || !['Admin', 'Moderator'].includes(this.currentUser.role)) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.isModerator) {
      this.activeTab = 'orders';
    }

    this.loadStores();
    this.loadOrders();

    if (this.isAdmin) {
      this.loadProducts();
      this.loadModerators();
    }
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'Admin';
  }

  get isModerator(): boolean {
    return this.currentUser?.role === 'Moderator';
  }

  get filteredProducts(): Product[] {
    const query = this.productSearch.trim().toLowerCase();
    const selectedStoreId = Number(this.productStoreFilter);

    return this.products.filter(product => {
      const matchesSearch = !query
        || product.name.toLowerCase().includes(query)
        || (product.category || '').toLowerCase().includes(query)
        || (product.description || '').toLowerCase().includes(query);
      const matchesStore = !selectedStoreId || (product.availableStoreIds || []).includes(selectedStoreId);

      return matchesSearch && matchesStore;
    });
  }

  get filteredOrders(): Order[] {
    const query = this.orderSearch.trim().toLowerCase();
    const status = this.orderStatusFilter;

    return this.orders.filter(order => {
      const matchesStatus = !status || order.status === status;
      const haystack = [
        order.id,
        order.customerName,
        order.email,
        order.phoneNumber,
        order.address,
        order.storeName,
        order.status
      ].filter(Boolean).join(' ').toLowerCase();

      return matchesStatus && (!query || haystack.includes(query));
    });
  }

  setTab(tab: DashboardTab): void {
    this.activeTab = this.isModerator ? 'orders' : tab;
  }

  loadStores(): void {
    this.productService.getStores().subscribe({
      next: stores => {
        this.stores = stores;
        this.productForm.availableStoreIds = this.productForm.availableStoreIds?.length ? this.productForm.availableStoreIds : [stores[0]?.id || 1];
        this.moderatorForm.assignedStoreId = this.moderatorForm.assignedStoreId || stores[0]?.id || 1;
      },
      error: () => this.toastService.show('Could not load stores.', 'error')
    });
  }

  loadProducts(): void {
    this.isLoadingProducts = true;
    this.productsError = '';

    this.productService.getProducts().subscribe({
      next: products => {
        this.products = products;
        this.isLoadingProducts = false;
      },
      error: () => {
        this.productsError = 'Could not load products.';
        this.isLoadingProducts = false;
        this.toastService.show(this.productsError, 'error');
      }
    });
  }

  loadOrders(): void {
    this.isLoadingOrders = true;
    this.ordersError = '';

    this.orderService.getOrders().subscribe({
      next: orders => {
        this.orders = orders;
        this.isLoadingOrders = false;
      },
      error: () => {
        this.ordersError = 'Could not load orders.';
        this.isLoadingOrders = false;
        this.toastService.show(this.ordersError, 'error');
      }
    });
  }

  loadModerators(): void {
    this.isLoadingModerators = true;
    this.moderatorsError = '';

    this.authService.getModerators().subscribe({
      next: moderators => {
        this.moderators = moderators;
        this.isLoadingModerators = false;
      },
      error: () => {
        this.moderatorsError = 'Could not load moderators.';
        this.isLoadingModerators = false;
        this.toastService.show(this.moderatorsError, 'error');
      }
    });
  }

  saveProduct(): void {
    const payload: Product = {
      ...this.productForm,
      price: Number(this.productForm.price) || 0,
      stockQuantity: Number(this.productForm.stockQuantity) || 0,
      sizes: this.parseCsv(this.sizesInput),
      colors: this.parseCsv(this.colorsInput),
      availableStoreIds: this.productForm.availableStoreIds?.length ? this.productForm.availableStoreIds : [this.stores[0]?.id || 1]
    };

    const request = this.editingProductId
      ? this.productService.updateProduct(this.editingProductId, payload)
      : this.productService.createProduct(payload);

    this.isSavingProduct = true;
    request.subscribe({
      next: () => {
        this.toastService.show(this.editingProductId ? 'Product updated.' : 'Product added.', 'success');
        this.resetProductForm();
        this.loadProducts();
        this.isSavingProduct = false;
      },
      error: () => {
        this.isSavingProduct = false;
        this.toastService.show('Could not save product.', 'error');
      }
    });
  }

  editProduct(product: Product): void {
    this.editingProductId = product.id;
    this.productForm = {
      ...product,
      availableStoreIds: [...(product.availableStoreIds || [])],
      sizes: [...(product.sizes || [])],
      colors: [...(product.colors || [])]
    };
    this.sizesInput = this.joinList(product.sizes);
    this.colorsInput = this.joinList(product.colors);
  }

  deleteProduct(product: Product): void {
    if (!product.id) {
      return;
    }

    this.openConfirm(this.label('confirmDeleteProduct'), this.label('delete'), () => {
      this.deletingProductIds.add(product.id!);
      this.productService.deleteProduct(product.id!).subscribe({
        next: () => {
          this.toastService.show('Product deleted.', 'success');
          this.loadProducts();
          this.deletingProductIds.delete(product.id!);
        },
        error: () => {
          this.deletingProductIds.delete(product.id!);
          this.toastService.show('Could not delete product.', 'error');
        }
      });
    });
  }

  uploadImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    this.isUploadingImage = true;
    this.http.post<{ Url?: string; url?: string }>(apiUrl('/api/uploads'), formData, {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).subscribe({
      next: response => {
        this.productForm.imageUrl = response.Url || response.url || this.productForm.imageUrl;
        this.isUploadingImage = false;
        this.toastService.show('Image uploaded.', 'success');
      },
      error: () => {
        this.isUploadingImage = false;
        this.toastService.show('Could not upload image.', 'error');
      }
    });
  }

  resetProductForm(): void {
    this.editingProductId = undefined;
    this.productForm = this.createBlankProduct();
    this.sizesInput = 'S, M, L, XL';
    this.colorsInput = 'Black, White';
  }

  updateOrder(order: Order, status: 'Accepted' | 'Rejected' | 'Completed'): void {
    if (!order.id) {
      return;
    }

    this.updatingOrderIds.add(order.id);
    this.orderService.updateOrderStatus(order.id, status).subscribe({
      next: () => {
        this.toastService.show('Order updated.', 'success');
        this.loadOrders();
        this.updatingOrderIds.delete(order.id!);
      },
      error: () => {
        this.updatingOrderIds.delete(order.id!);
        this.toastService.show('Could not update order.', 'error');
      }
    });
  }

  saveModerator(): void {
    const payload: ModeratorPayload = {
      ...this.moderatorForm,
      assignedStoreId: Number(this.moderatorForm.assignedStoreId) || this.stores[0]?.id || 1,
      isActive: this.moderatorForm.isActive !== false
    };

    if (this.editingModeratorId && !payload.password) {
      delete payload.password;
    }

    const request = this.editingModeratorId
      ? this.authService.updateModerator(this.editingModeratorId, payload)
      : this.authService.createModerator(payload);

    request.subscribe({
      next: () => {
        this.toastService.show(this.editingModeratorId ? 'Moderator updated.' : 'Moderator added.', 'success');
        this.resetModeratorForm();
        this.loadModerators();
      },
      error: () => this.toastService.show('Could not save moderator.', 'error')
    });
  }

  editModerator(moderator: ModeratorAccount): void {
    this.editingModeratorId = moderator.id;
    this.moderatorForm = {
      username: moderator.username,
      password: '',
      email: moderator.email || '',
      phoneNumber: moderator.phoneNumber || '',
      assignedStoreId: moderator.assignedStoreId || this.stores[0]?.id || 1,
      isActive: moderator.isActive !== false
    };
  }

  deactivateModerator(moderator: ModeratorAccount): void {
    this.openConfirm(this.label('confirmDeactivateModerator'), this.label('deactivate'), () => {
      this.authService.deactivateModerator(moderator.id).subscribe({
        next: () => {
          this.toastService.show('Moderator deactivated.', 'success');
          this.loadModerators();
        },
        error: () => this.toastService.show('Could not deactivate moderator.', 'error')
      });
    });
  }

  resetModeratorForm(): void {
    this.editingModeratorId = undefined;
    this.moderatorForm = this.createBlankModerator();
  }

  toggleProductStore(storeId: number): void {
    const selected = new Set(this.productForm.availableStoreIds || []);
    if (selected.has(storeId)) {
      selected.delete(storeId);
    } else {
      selected.add(storeId);
    }
    this.productForm.availableStoreIds = Array.from(selected);
  }

  isStoreSelected(storeId: number): boolean {
    return (this.productForm.availableStoreIds || []).includes(storeId);
  }

  countOrders(status: string): number {
    return this.orders.filter(order => order.status === status).length;
  }

  isDeletingProduct(productId?: number): boolean {
    return !!productId && this.deletingProductIds.has(productId);
  }

  isUpdatingOrder(orderId?: number): boolean {
    return !!orderId && this.updatingOrderIds.has(orderId);
  }

  statusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  statusLabel(status: string): string {
    const statusLabels: Record<string, DashboardLabelKey> = {
      Pending: 'pending',
      Accepted: 'accepted',
      Rejected: 'rejected',
      Completed: 'completed'
    };
    return statusLabels[status] ? this.label(statusLabels[status]) : status;
  }

  statusIcon(status: string) {
    const icons = {
      Pending: this.icons.pending,
      Accepted: this.icons.accept,
      Rejected: this.icons.reject,
      Completed: this.icons.completed
    };
    return icons[status as keyof typeof icons] || this.icons.orders;
  }

  formatPaymentMethod(paymentMethod?: string): string {
    if (!paymentMethod || paymentMethod === 'CashOnDelivery') {
      return 'Cash on delivery';
    }

    return paymentMethod;
  }

  getImgUrl(url: string | undefined): string {
    return assetUrl(url);
  }

  joinList(value?: string[]): string {
    return (value || []).join(', ');
  }

  getStoreName(storeId?: number | null): string {
    return this.stores.find(store => store.id === storeId)?.name || `Store #${storeId || '-'}`;
  }

  getStoreNames(storeIds?: number[]): string {
    const ids = storeIds || [];
    if (ids.length === 0) {
      return this.label('noStores');
    }
    return ids.map(id => this.getStoreName(id)).join(', ');
  }

  label(key: DashboardLabelKey): string {
    const currentLabels = dashboardLabels[this.translation.currentLanguage] as Partial<Record<DashboardLabelKey, string>>;
    return currentLabels[key] || dashboardLabels.en[key];
  }

  openConfirm(message: string, confirmLabel: string, action: () => void): void {
    this.confirmDialog = { message, confirmLabel, action };
  }

  closeConfirm(): void {
    this.confirmDialog = undefined;
  }

  runConfirmAction(): void {
    const action = this.confirmDialog?.action;
    this.closeConfirm();
    action?.();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark', this.isDarkMode);
  }

  private parseCsv(value: string): string[] {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  private createBlankProduct(): Product {
    return {
      name: '',
      description: '',
      price: 0,
      category: '',
      stockQuantity: 0,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'White'],
      availableStoreIds: [1]
    };
  }

  private createBlankModerator(): ModeratorPayload {
    return {
      username: '',
      password: '',
      email: '',
      phoneNumber: '',
      assignedStoreId: this.stores[0]?.id || 1,
      isActive: true
    };
  }
}
