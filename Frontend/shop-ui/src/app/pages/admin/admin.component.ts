import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
    adminSubtitle: 'لوحة بسيطة لإدارة المنتجات، الطلبات، والمودريتورز حسب الفروع.',
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
    noSizes: 'No sizes',
    noColors: 'No colors',
    noStores: 'No stores',
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
    completed: 'تم',
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
    noEmail: 'No email',
    deactivate: 'تعطيل'
  }
} as const;

type DashboardLabelKey = keyof typeof dashboardLabels.en;

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-shell">
      <div class="admin-backdrop"></div>

      <nav class="glass dashboard-nav">
        <a routerLink="/" class="brand">Moon Store</a>
        <div class="nav-actions">
          <button type="button" routerLink="/" class="ghost-btn"><span class="btn-icon">🏬</span>{{ label('shop') }}</button>
          <button
            type="button"
            class="ghost-btn compact-control"
            (click)="translation.toggleLanguage()"
            [attr.aria-label]="translation.isArabic ? 'Switch language to English' : 'Switch language to Arabic'">
            <span class="btn-icon">🌐</span>
            <span>{{ label('languageToggle') }}</span>
          </button>
          <button
            type="button"
            class="ghost-btn compact-control"
            (click)="toggleTheme()"
            [attr.aria-label]="isDarkMode ? label('themeLight') : label('themeDark')">
            <span class="btn-icon">{{ isDarkMode ? '☀️' : '🌙' }}</span>
            <span>{{ isDarkMode ? label('themeLight') : label('themeDark') }}</span>
          </button>
          <button type="button" class="ghost-btn danger" (click)="logout()"><span class="btn-icon">🚪</span>{{ label('logout') }}</button>
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
            <span class="nav-icon">📊</span>{{ label('overview') }}
          </button>
          <button type="button" [class.active]="activeTab === 'products'" (click)="setTab('products')">
            <span class="nav-icon">👕</span>{{ label('products') }}
          </button>
          <button type="button" [class.active]="activeTab === 'orders'" (click)="setTab('orders')">
            <span class="nav-icon">🧾</span>{{ label('orders') }}
          </button>
          <button type="button" [class.active]="activeTab === 'moderators'" (click)="setTab('moderators')">
            <span class="nav-icon">🧑‍💼</span>{{ label('moderators') }}
          </button>
        </section>

        <section class="glass stats-grid" *ngIf="activeTab === 'overview' && isAdmin">
          <article>
            <span class="stat-icon">👕</span>
            <span>{{ label('totalProducts') }}</span>
            <strong>{{ products.length }}</strong>
          </article>
          <article>
            <span class="stat-icon">⏳</span>
            <span>{{ label('pendingOrders') }}</span>
            <strong>{{ countOrders('Pending') }}</strong>
          </article>
          <article>
            <span class="stat-icon">✅</span>
            <span>{{ label('completedOrders') }}</span>
            <strong>{{ countOrders('Completed') }}</strong>
          </article>
          <article>
            <span class="stat-icon">🏬</span>
            <span>{{ label('stores') }}</span>
            <strong>{{ stores.length }}</strong>
          </article>
        </section>

        <section class="panel-grid" *ngIf="activeTab === 'products' && isAdmin">
          <form class="glass editor-card" (ngSubmit)="saveProduct()">
            <h2><span class="section-icon">👕</span>{{ editingProductId ? label('editProduct') : label('addProduct') }}</h2>

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
              <input type="file" accept="image/*" (change)="uploadImage($event)">
            </label>

            <img *ngIf="productForm.imageUrl" class="preview-image" [src]="getImgUrl(productForm.imageUrl)" alt="Product preview">

            <div class="button-row">
              <button class="primary-btn" type="submit" [disabled]="isSavingProduct"><span class="btn-icon">💾</span>{{ isSavingProduct ? 'Saving...' : (editingProductId ? label('saveChanges') : label('addProduct')) }}</button>
              <button class="ghost-btn" type="button" *ngIf="editingProductId" (click)="resetProductForm()"><span class="btn-icon">↩</span>{{ label('cancel') }}</button>
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
                <button type="button" class="ghost-btn" (click)="editProduct(product)"><span class="btn-icon">✏️</span>{{ label('edit') }}</button>
                <button type="button" class="ghost-btn danger" [disabled]="isDeletingProduct(product.id)" (click)="deleteProduct(product)"><span class="btn-icon">🗑️</span>{{ isDeletingProduct(product.id) ? 'Deleting...' : label('delete') }}</button>
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
              <h2><span class="section-icon">🧾</span>{{ label('orders') }}</h2>
              <p>{{ isModerator ? label('branchOnlyOrders') : label('allOrders') }}</p>
            </div>
            <button type="button" class="ghost-btn" (click)="loadOrders()"><span class="btn-icon">🔄</span>{{ label('refresh') }}</button>
          </div>

          <div class="empty-card" *ngIf="isLoadingOrders">{{ label('loadingOrders') }}</div>
          <div class="empty-card error-card" *ngIf="ordersError">{{ ordersError }}</div>

          <article class="order-card" *ngFor="let order of orders">
            <div class="order-top">
              <div>
                <h3>Order #{{ order.id }} · {{ order.customerName }}</h3>
                <p>{{ order.storeName || ('Store #' + order.storeId) }} · {{ order.orderDate | date:'medium' }}</p>
                <p class="hint-line">{{ isModerator ? label('moderatorStoreScope') : label('autoAssignedStore') }}</p>
              </div>
              <span class="status-pill" [ngClass]="statusClass(order.status)">
                <span class="status-icon">{{ statusIcon(order.status) }}</span>{{ statusLabel(order.status) }}
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
              <button type="button" class="accept" [disabled]="order.status === 'Accepted' || isUpdatingOrder(order.id)" (click)="updateOrder(order, 'Accepted')"><span class="btn-icon">👍</span>{{ label('accept') }}</button>
              <button type="button" class="reject" [disabled]="order.status === 'Rejected' || isUpdatingOrder(order.id)" (click)="updateOrder(order, 'Rejected')"><span class="btn-icon">✖</span>{{ label('reject') }}</button>
              <button type="button" class="complete" [disabled]="order.status === 'Completed' || isUpdatingOrder(order.id)" (click)="updateOrder(order, 'Completed')"><span class="btn-icon">✅</span>{{ label('completedAction') }}</button>
            </div>
          </article>

          <div class="empty-card" *ngIf="!isLoadingOrders && !ordersError && orders.length === 0">{{ label('noOrders') }}</div>
        </section>

        <section class="panel-grid" *ngIf="activeTab === 'moderators' && isAdmin">
          <form class="glass editor-card" (ngSubmit)="saveModerator()">
            <h2><span class="section-icon">🧑‍💼</span>{{ editingModeratorId ? label('editModerator') : label('addModerator') }}</h2>

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
              <button class="primary-btn" type="submit"><span class="btn-icon">💾</span>{{ editingModeratorId ? label('saveModerator') : label('addModerator') }}</button>
              <button class="ghost-btn" type="button" *ngIf="editingModeratorId" (click)="resetModeratorForm()"><span class="btn-icon">↩</span>{{ label('cancel') }}</button>
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
                <button type="button" class="ghost-btn" (click)="editModerator(moderator)"><span class="btn-icon">✏️</span>{{ label('edit') }}</button>
                <button type="button" class="ghost-btn danger" (click)="deactivateModerator(moderator)"><span class="btn-icon">🚫</span>{{ label('deactivate') }}</button>
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
  styles: [`
    .admin-shell { min-height: 100vh; position: relative; padding: 24px; overflow: hidden; color: var(--text-color); }
    .admin-backdrop {
      position: fixed;
      inset: 0;
      z-index: -1;
      background:
        radial-gradient(circle at 12% 12%, rgba(155, 142, 199, 0.26), transparent 28%),
        radial-gradient(circle at 82% 16%, rgba(90, 164, 216, 0.18), transparent 24%),
        linear-gradient(180deg, #05070f 0%, #0b1020 55%, #080b14 100%);
    }
    :host-context(body:not(.dark)) .admin-backdrop {
      background:
        radial-gradient(circle at 12% 12%, rgba(189, 166, 206, 0.34), transparent 28%),
        radial-gradient(circle at 82% 16%, rgba(180, 211, 217, 0.42), transparent 24%),
        linear-gradient(180deg, #fcfbff 0%, #edf3fa 55%, #f4ede5 100%);
    }
    .dashboard-nav, .hero-card, .stats-grid, .editor-card, .product-row, .orders-panel, .moderator-row {
      border-radius: 28px;
      border: 1px solid var(--glass-border);
    }
    .dashboard-nav {
      max-width: 1180px;
      margin: 0 auto 22px;
      padding: 16px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 14px;
      z-index: 10;
    }
    .brand { color: var(--text-color); text-decoration: none; font-weight: 900; letter-spacing: .02em; }
    .nav-actions, .button-row, .row-actions, .order-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
    .dashboard-container { max-width: 1180px; margin: 0 auto; display: grid; gap: 20px; }
    .hero-card { padding: clamp(24px, 4vw, 42px); display: flex; justify-content: space-between; align-items: center; gap: 18px; }
    .hero-card h1 { font-size: clamp(2.2rem, 5vw, 4.6rem); margin: 6px 0 10px; line-height: 1; }
    .hero-card p { max-width: 680px; line-height: 1.7; opacity: .78; }
    .eyebrow { text-transform: uppercase; letter-spacing: .18em; color: var(--secondary-accent); font-weight: 800; font-size: .78rem; }
    .role-pill {
      min-width: 140px;
      padding: 16px;
      border-radius: 22px;
      background: rgba(255, 255, 255, .08);
      display: grid;
      gap: 6px;
      text-align: center;
      font-weight: 800;
    }
    .tabs { display: flex; gap: 10px; flex-wrap: wrap; }
    .tabs button, .ghost-btn, .primary-btn, .order-actions button {
      border: 0;
      cursor: pointer;
      border-radius: 999px;
      padding: 11px 18px;
      font-weight: 800;
      color: var(--text-color);
      background: rgba(255, 255, 255, .08);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .tabs button.active, .primary-btn {
      color: #fff;
      background: linear-gradient(135deg, var(--primary-accent), var(--secondary-accent));
      box-shadow: 0 18px 38px rgba(112, 89, 192, .25);
    }
    .ghost-btn.danger, .danger { color: #ff8d99; }
    .stats-grid { padding: 20px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
    .stats-grid article {
      padding: 22px;
      border-radius: 22px;
      background: rgba(255, 255, 255, .07);
      display: grid;
      gap: 8px;
    }
    .stat-icon {
      width: 42px;
      height: 42px;
      display: inline-grid;
      place-items: center;
      border-radius: 16px;
      background: rgba(255, 255, 255, .1);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .08);
      font-size: 1.35rem;
      margin-bottom: 6px;
    }
    .stats-grid span { opacity: .72; }
    .stats-grid strong { font-size: 2.2rem; }
    .panel-grid { display: grid; grid-template-columns: minmax(300px, 390px) 1fr; gap: 20px; align-items: start; }
    .editor-card { padding: 22px; display: grid; gap: 14px; position: sticky; top: 104px; }
    .editor-card h2, .orders-panel h2 { margin: 0; font-size: 1.6rem; }
    .editor-card h2, .orders-panel h2 {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-icon {
      width: 42px;
      height: 42px;
      display: inline-grid;
      place-items: center;
      flex: 0 0 auto;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(255, 255, 255, .13), rgba(255, 255, 255, .04));
      font-size: 1.25rem;
    }
    .nav-icon, .btn-icon, .status-icon {
      display: inline-grid;
      place-items: center;
      line-height: 1;
      flex: 0 0 auto;
    }
    .compact-control {
      min-width: 92px;
    }
    label { display: grid; gap: 7px; font-weight: 700; }
    input, textarea, select {
      width: 100%;
      padding: 12px 13px;
      border-radius: 14px;
      border: 1px solid var(--glass-border);
      background: rgba(255, 255, 255, .07);
      color: var(--text-color);
      outline: none;
    }
    textarea { resize: vertical; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .store-picker { display: flex; flex-wrap: wrap; gap: 9px; align-items: center; }
    .store-picker > span { width: 100%; font-weight: 800; }
    .checkbox-pill, .inline-check {
      display: flex;
      grid-auto-flow: column;
      align-items: center;
      gap: 8px;
      width: auto;
      padding: 10px 12px;
      border-radius: 999px;
      background: rgba(255, 255, 255, .07);
      font-weight: 700;
    }
    .checkbox-pill input, .inline-check input { width: auto; }
    .preview-image {
      width: 100%;
      max-height: 190px;
      object-fit: contain;
      border-radius: 20px;
      background: rgba(255, 255, 255, .07);
      padding: 12px;
    }
    .list-stack { display: grid; gap: 14px; }
    .filter-card {
      padding: 16px;
      display: grid;
      grid-template-columns: minmax(180px, 1fr) minmax(160px, 220px);
      gap: 12px;
      align-items: end;
    }
    .product-row, .moderator-row {
      padding: 16px;
      display: grid;
      grid-template-columns: 76px 1fr auto;
      gap: 14px;
      align-items: center;
    }
    .moderator-row { grid-template-columns: 1fr auto; }
    .product-row img {
      width: 76px;
      height: 76px;
      object-fit: contain;
      border-radius: 18px;
      background: rgba(255, 255, 255, .07);
      padding: 8px;
    }
    .product-row h3, .moderator-row h3 { margin: 0 0 6px; }
    .product-row p, .moderator-row p, .panel-heading p, .order-top p { margin: 0; opacity: .76; }
    .product-row small, .moderator-row small { opacity: .64; }
    .orders-panel { padding: 22px; display: grid; gap: 16px; }
    .panel-heading, .order-top, .order-bottom {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-start;
    }
    .order-card {
      padding: 18px;
      border-radius: 24px;
      background: rgba(255, 255, 255, .065);
      display: grid;
      gap: 14px;
    }
    .order-top h3 { margin: 0 0 6px; }
    .status-pill {
      padding: 8px 12px;
      border-radius: 999px;
      font-weight: 900;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 7px;
    }
    .status-pending { color: #f1c40f; background: rgba(241, 196, 15, .16); }
    .status-accepted { color: #4ea6db; background: rgba(52, 152, 219, .16); }
    .status-rejected { color: #ff6b6b; background: rgba(255, 107, 107, .16); }
    .status-completed { color: #44d486; background: rgba(46, 204, 113, .16); }
    .order-items { display: grid; gap: 8px; }
    .order-items div {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 16px;
      background: rgba(255, 255, 255, .055);
    }
    .order-items span, .order-bottom span { opacity: .74; }
    .order-actions button { color: #fff; }
    .tabs button:disabled, .ghost-btn:disabled, .primary-btn:disabled, .order-actions button:disabled {
      opacity: .45;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    .accept { background: linear-gradient(135deg, #4ea6db, #5f7cff) !important; }
    .reject { background: linear-gradient(135deg, #ff6b6b, #ff4757) !important; }
    .complete { background: linear-gradient(135deg, #2ecc71, #57d8a3) !important; }
    .empty-card { padding: 24px; text-align: center; opacity: .72; }
    .error-card { color: #ff8d99; opacity: 1; }
    .hint-line {
      color: var(--secondary-accent);
      font-size: .86rem;
      margin-top: 4px !important;
      opacity: .9 !important;
    }
    .confirm-backdrop {
      position: fixed;
      inset: 0;
      z-index: 80;
      display: grid;
      place-items: center;
      padding: 20px;
      background: rgba(0, 0, 0, .48);
      backdrop-filter: blur(10px);
    }
    .confirm-card {
      width: min(420px, 100%);
      padding: 24px;
      border-radius: 24px;
      display: grid;
      gap: 14px;
    }
    .confirm-card h3, .confirm-card p { margin: 0; }
    @media (max-width: 900px) {
      .admin-shell { padding: 14px; }
      .hero-card, .panel-heading, .order-top, .order-bottom { flex-direction: column; }
      .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .panel-grid { grid-template-columns: 1fr; }
      .editor-card { position: static; }
      .product-row { grid-template-columns: 70px 1fr; }
      .product-row .row-actions { grid-column: 1 / -1; }
    }
    @media (max-width: 560px) {
      .admin-shell { padding: 10px; overflow: visible; }
      .dashboard-nav { align-items: flex-start; flex-direction: column; padding: 12px; border-radius: 22px; }
      .hero-card { padding: 18px; }
      .hero-card h1 { font-size: clamp(2rem, 12vw, 2.55rem); overflow-wrap: anywhere; }
      .role-pill { width: 100%; align-items: flex-start; }
      .tabs { position: sticky; top: 8px; z-index: 20; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); padding: 8px; }
      .tabs button { min-height: 46px; justify-content: center; padding: 10px; }
      .stats-grid strong { font-size: 1.85rem; }
      .editor-card, .orders-panel { padding: 16px; }
      .editor-card h2, .orders-panel h2 { font-size: 1.35rem; }
      .form-row, .stats-grid, .filter-card { grid-template-columns: 1fr; }
      .product-row, .moderator-row { grid-template-columns: 1fr; }
      .product-row img { width: 100%; height: 160px; }
      .order-items div { flex-direction: column; }
      .nav-actions, .button-row, .row-actions, .order-actions, .tabs { width: 100%; }
      .nav-actions button, .button-row button, .row-actions button, .order-actions button, .tabs button { flex: 1; min-height: 46px; }
      .nav-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
      .nav-actions .danger { grid-column: 1 / -1; }
      .button-row, .row-actions, .order-actions { display: grid; grid-template-columns: 1fr; }
      .order-card { padding: 14px; border-radius: 20px; }
      .order-bottom { gap: 10px; }
      .order-bottom span, .order-items span, .product-row p, .product-row small, .moderator-row p { overflow-wrap: anywhere; }
      input, textarea, select { min-height: 46px; font-size: 16px; }
      .store-picker { gap: 8px; }
      .checkbox-pill, .inline-check { min-height: 42px; }
      .confirm-card { padding: 18px; }
    }
  `]
})
export class AdminComponent implements OnInit {
  currentUser: User | null = null;
  isDarkMode = true;
  activeTab: DashboardTab = 'overview';
  products: Product[] = [];
  orders: Order[] = [];
  stores: Store[] = [];
  moderators: ModeratorAccount[] = [];
  productSearch = '';
  productStoreFilter = 0;
  isLoadingProducts = false;
  isLoadingOrders = false;
  isLoadingModerators = false;
  isSavingProduct = false;
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

    this.http.post<{ Url?: string; url?: string }>(apiUrl('/api/uploads'), formData, {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).subscribe({
      next: response => this.productForm.imageUrl = response.Url || response.url || this.productForm.imageUrl,
      error: () => this.toastService.show('Could not upload image.', 'error')
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

  statusIcon(status: string): string {
    const icons: Record<string, string> = {
      Pending: '⏳',
      Accepted: '👍',
      Rejected: '✖',
      Completed: '✅'
    };
    return icons[status] || '•';
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
