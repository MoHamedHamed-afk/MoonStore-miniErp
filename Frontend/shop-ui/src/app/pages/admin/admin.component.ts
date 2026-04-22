import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Order, OrderService, OrderItem } from '../../services/order.service';
import { Product, ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';
import { TranslationService } from '../../services/translation.service';
import { apiUrl, assetUrl } from '../../core/api.config';

type AdminTab = 'products' | 'orders' | 'customers' | 'purchase-orders' | 'insights';

interface TrendPoint {
  label: string;
  revenue: number;
  orders: number;
}

interface TopProductInsight {
  name: string;
  units: number;
  revenue: number;
  imageUrl?: string;
}

interface StatusInsight {
  label: string;
  count: number;
  color: string;
}

interface CategoryInsight {
  label: string;
  revenue: number;
  units: number;
}

interface SupplierInsight {
  name: string;
  products: number;
  stockValue: number;
}

interface AdminCustomer {
  id: number;
  username: string;
  email?: string;
  phoneNumber?: string;
  role: string;
  ordersCount: number;
  totalSpent: number;
  latestOrderDate?: string;
  latestOrderStatus?: string;
}

interface RestockSuggestion {
  productId: number;
  productName: string;
  supplier: string;
  category: string;
  imageUrl?: string;
  currentStock: number;
  unitsSoldLast30Days: number;
  recommendedQuantity: number;
  stockGap: number;
  costPrice: number;
  estimatedCost: number;
  priority: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <nav class="glass navbar">
      <div class="logo">{{ translation.t('admin.title') }}</div>

      <div class="nav-links">
        <button (click)="activeTab = 'products'" [class.active]="activeTab === 'products'" class="tab-btn">{{ translation.t('admin.products') }}</button>
        <button (click)="activeTab = 'orders'" [class.active]="activeTab === 'orders'" class="tab-btn">{{ translation.t('admin.orders') }}</button>
        <button (click)="activeTab = 'customers'" [class.active]="activeTab === 'customers'" class="tab-btn">{{ translation.t('admin.customers') }}</button>
        <button (click)="activeTab = 'purchase-orders'" [class.active]="activeTab === 'purchase-orders'" class="tab-btn">{{ translation.t('admin.purchaseOrders') }}</button>
        <button (click)="activeTab = 'insights'" [class.active]="activeTab === 'insights'" class="tab-btn">{{ translation.t('admin.insights') }}</button>
        <a routerLink="/" class="shop-link">{{ translation.t('admin.shopHome') }}</a>
        <button (click)="logout()" class="btn logout-btn">{{ translation.t('nav.logout') }}</button>
      </div>
    </nav>

    <div class="container admin-container">
      <div class="dashboard-stats">
        <div class="glass stat-card">
          <h4>{{ translation.t('admin.totalProducts') }}</h4>
          <p class="stat-value">{{ products.length }}</p>
        </div>
        <div class="glass stat-card">
          <h4>{{ translation.t('admin.totalOrders') }}</h4>
          <p class="stat-value stat-accent">{{ orders.length }}</p>
        </div>
        <div class="glass stat-card">
          <h4>{{ translation.t('admin.revenue') }}</h4>
          <p class="stat-value stat-success">\${{ totalRevenue | number:'1.0-0' }}</p>
        </div>
        <div class="glass stat-card">
          <h4>{{ translation.t('admin.lowStock') }}</h4>
          <p class="stat-value stat-warning">{{ lowStockProducts.length }}</p>
        </div>
      </div>

      <section *ngIf="activeTab === 'products'">
        <div class="header-action">
          <h2>{{ translation.t('admin.productManagement') }}</h2>
          <button class="btn primary-btn" (click)="showForm = true">{{ translation.t('admin.addProduct') }}</button>
        </div>

        <div class="glass form-container" *ngIf="showForm">
          <h3>{{ isEditing ? translation.t('admin.editProduct') : translation.t('admin.addNewProduct') }}</h3>

          <form (ngSubmit)="saveProduct()">
            <div class="field-group">
              <label>{{ translation.t('admin.fields.name') }}</label>
              <small>{{ translation.t('admin.fieldHelp.name') }}</small>
              <input type="text" [(ngModel)]="currentProduct.name" name="name" [placeholder]="translation.t('admin.fields.name')" required class="form-control">
            </div>

            <div class="field-group">
              <label>{{ translation.t('admin.fields.description') }}</label>
              <small>{{ translation.t('admin.fieldHelp.description') }}</small>
              <input type="text" [(ngModel)]="currentProduct.description" name="description" [placeholder]="translation.t('admin.fields.description')" required class="form-control">
            </div>

            <div class="field-group">
              <label>{{ translation.t('admin.fields.price') }}</label>
              <small>{{ translation.t('admin.fieldHelp.price') }}</small>
              <input type="number" [(ngModel)]="currentProduct.price" name="price" [placeholder]="translation.t('admin.fields.price')" required class="form-control">
            </div>

            <div class="field-group">
              <label>{{ translation.t('admin.fields.costPrice') }}</label>
              <small>{{ translation.t('admin.fieldHelp.costPrice') }}</small>
              <input type="number" [(ngModel)]="currentProduct.costPrice" name="costPrice" [placeholder]="translation.t('admin.fields.costPrice')" min="0" required class="form-control">
            </div>

            <div class="field-group">
              <label>{{ translation.t('admin.fields.supplier') }}</label>
              <small>{{ translation.t('admin.fieldHelp.supplier') }}</small>
              <input type="text" [(ngModel)]="currentProduct.supplier" name="supplier" [placeholder]="translation.t('admin.fields.supplier')" required class="form-control">
            </div>

            <div class="field-group">
              <label>{{ translation.t('admin.fields.stockQuantity') }}</label>
              <small>{{ translation.t('admin.fieldHelp.stockQuantity') }}</small>
              <input type="number" [(ngModel)]="currentProduct.stockQuantity" name="stockQuantity" [placeholder]="translation.t('admin.fields.stockQuantity')" min="0" required class="form-control">
            </div>

            <div class="field-group">
              <label>{{ translation.t('admin.fields.category') }}</label>
              <small>{{ translation.t('admin.fieldHelp.category') }}</small>
              <select [(ngModel)]="currentProduct.category" name="category" class="form-control">
                <option value="Winter">{{ translation.t('admin.winter') }}</option>
                <option value="Summer">{{ translation.t('admin.summer') }}</option>
              </select>
            </div>

            <div class="file-upload-group">
              <label>{{ translation.t('admin.fields.image') }}</label>
              <small>{{ translation.t('admin.fieldHelp.image') }}</small>
              <input type="file" (change)="onFileSelected($event)" accept="image/*" class="form-control file-input">

              <div *ngIf="currentProduct.imageUrl" class="img-preview">
                <img [src]="getImgUrl(currentProduct.imageUrl)" alt="Current product image">
                <span>{{ translation.t('admin.currentImage') }}</span>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn primary-btn">{{ translation.t('common.save') }}</button>
              <button type="button" class="btn cancel-btn" (click)="cancelForm()">{{ translation.t('common.cancel') }}</button>
            </div>
          </form>
        </div>

        <div class="product-list">
          <div class="glass product-row" *ngFor="let product of pagedProducts">
            <div class="row-info">
              <img [src]="getImgUrl(product.imageUrl)" class="row-img" [alt]="product.name">

              <div>
                <div class="row-name">{{ product.name }}</div>
                <div class="row-meta">
                  <span class="row-price">\${{ product.price }}</span>
                  <span class="row-cost">Cost \${{ product.costPrice || 0 }}</span>
                  <span class="row-category">{{ product.category || translation.t('admin.unsorted') }}</span>
                  <span class="row-stock" [class.warning]="isLowStock(product)" [class.danger]="isOutOfStock(product)">
                    {{ getStockLabel(product) }}
                  </span>
                  <span class="row-supplier">{{ product.supplier || translation.t('admin.noSupplier') }}</span>
                </div>
              </div>
            </div>

            <div class="row-actions">
              <button class="btn edit-btn" (click)="editProduct(product)">{{ translation.t('common.edit') }}</button>
              <button class="btn delete-btn" (click)="deleteProduct(product.id!)">{{ translation.t('common.remove') }}</button>
            </div>
          </div>
        </div>

        <div class="pagination" *ngIf="totalPages > 1">
          <button class="page-btn" (click)="changePage(currentPage - 1)" [disabled]="currentPage === 1">{{ translation.t('common.previous') }}</button>
          <button
            *ngFor="let page of pages"
            class="page-btn"
            [class.active]="page === currentPage"
            (click)="changePage(page)">
            {{ page }}
          </button>
          <button class="page-btn" (click)="changePage(currentPage + 1)" [disabled]="currentPage === totalPages">{{ translation.t('common.next') }}</button>
        </div>
      </section>

      <section *ngIf="activeTab === 'orders'">
        <div class="header-action">
          <h2>{{ translation.t('admin.realtimeOrders') }}</h2>
          <p class="section-subtitle">{{ translation.t('admin.trackOrders') }}</p>
        </div>

        <div class="orders-list">
          <div class="glass order-row" *ngFor="let order of pagedOrders">
            <div class="order-header">
              <span class="order-id">Order #{{ order.id }}</span>
              <span [style.color]="getStatusColor(order.status)" class="order-status">{{ translation.t('status.' + order.status) }}</span>
            </div>

            <div class="order-details">
              <div>{{ translation.t('common.customer') }}: {{ order.customerName }} ({{ order.email }})</div>
              <div>{{ translation.t('common.address') }}: {{ order.address }}</div>
              <div>{{ translation.t('common.date') }}: {{ order.orderDate | date:'medium' }}</div>
            </div>

            <div class="order-items-preview" *ngIf="order.items?.length">
              <div class="order-item-chip" *ngFor="let item of order.items">
                <img [src]="getImgUrl(item.productImageUrl)" [alt]="item.productName">
                <div>
                  <strong>{{ item.productName }}</strong>
                  <span>{{ translation.t('myOrders.qtyPrice', { quantity: item.quantity, price: item.unitPrice }) }}</span>
                </div>
              </div>
            </div>

            <div class="order-footer">
              <div class="order-amount">\${{ order.totalAmount }}</div>

              <div class="order-actions">
                <button *ngIf="order.status === 'Pending'" (click)="updateOrderStatus(order.id!, 'Shipped')" class="btn action-btn">
                  {{ translation.t('admin.markShipped') }}
                </button>
                <button *ngIf="order.status === 'Pending'" (click)="updateOrderStatus(order.id!, 'Cancelled')" class="btn delete-btn">
                  {{ translation.t('admin.markCancelled') }}
                </button>
                <button *ngIf="order.status === 'Shipped'" (click)="updateOrderStatus(order.id!, 'Delivered')" class="btn action-btn deliver-btn">
                  {{ translation.t('admin.markDelivered') }}
                </button>
                <button *ngIf="order.status === 'ReturnRequested'" (click)="updateOrderStatus(order.id!, 'Refunded')" class="btn action-btn return-btn">
                  {{ translation.t('admin.approveRefund') }}
                </button>
                <button *ngIf="order.status === 'ReturnRequested'" (click)="updateOrderStatus(order.id!, 'Delivered')" class="btn edit-btn">
                  {{ translation.t('admin.rejectReturn') }}
                </button>
              </div>
            </div>
          </div>

          <div *ngIf="orders.length === 0" class="empty-state">
            {{ translation.t('admin.noOrders') }}
          </div>
        </div>

        <div class="pagination" *ngIf="ordersTotalPages > 1">
          <button class="page-btn" (click)="changeOrdersPage(ordersPage - 1)" [disabled]="ordersPage === 1">{{ translation.t('common.previous') }}</button>
          <button
            *ngFor="let page of orderPages"
            class="page-btn"
            [class.active]="page === ordersPage"
            (click)="changeOrdersPage(page)">
            {{ page }}
          </button>
          <button class="page-btn" (click)="changeOrdersPage(ordersPage + 1)" [disabled]="ordersPage === ordersTotalPages">{{ translation.t('common.next') }}</button>
        </div>
      </section>

      <section *ngIf="activeTab === 'customers'">
        <div class="header-action">
          <div>
            <h2>{{ translation.t('admin.customerManagement') }}</h2>
            <p class="section-subtitle">{{ translation.t('admin.customerManagementCopy') }}</p>
          </div>
        </div>

        <div class="product-list" *ngIf="customers.length > 0; else noCustomersState">
          <div class="glass product-row customer-row" *ngFor="let customer of customers">
            <div class="row-info">
              <div class="customer-avatar">{{ customer.username.charAt(0) | uppercase }}</div>

              <div>
                <div class="row-name">{{ customer.username }}</div>
                <div class="row-meta">
                  <span class="row-category">{{ customer.email || translation.t('admin.noEmail') }}</span>
                  <span class="row-supplier">{{ customer.phoneNumber || translation.t('admin.noPhone') }}</span>
                  <span class="row-stock">{{ translation.t('admin.customersCount') }}: {{ customer.ordersCount }}</span>
                  <span class="row-cost">{{ translation.t('admin.totalSpent') }} \${{ customer.totalSpent | number:'1.0-0' }}</span>
                  <span class="row-category" *ngIf="customer.latestOrderStatus">
                    {{ translation.t('admin.latestOrder') }}: {{ translation.t('status.' + customer.latestOrderStatus) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="customer-side">
              <strong>\${{ customer.totalSpent | number:'1.0-0' }}</strong>
              <span *ngIf="customer.latestOrderDate">{{ customer.latestOrderDate | date:'mediumDate' }}</span>
            </div>
          </div>
        </div>

        <ng-template #noCustomersState>
          <div class="glass empty-panel">
            {{ translation.t('admin.noCustomers') }}
          </div>
        </ng-template>
      </section>

      <section *ngIf="activeTab === 'purchase-orders'">
        <div class="header-action">
          <div>
            <h2>{{ translation.t('admin.restockPlanning') }}</h2>
            <p class="section-subtitle">{{ translation.t('admin.restockPlanningCopy') }}</p>
          </div>
        </div>

        <div class="supplier-groups" *ngIf="restockSuggestions.length > 0; else noRestockState">
          <div class="glass supplier-group" *ngFor="let group of groupedRestockSuggestions">
            <div class="supplier-summary">
              <div>
                <h3>{{ group.supplier }}</h3>
                <p>{{ group.items.length }} {{ translation.t('admin.products') }}</p>
              </div>
              <strong>{{ translation.t('admin.supplierTotal') }}: \${{ group.totalEstimatedCost | number:'1.0-0' }}</strong>
            </div>

            <div class="restock-list">
              <div class="restock-row" *ngFor="let item of group.items">
                <img [src]="getImgUrl(item.imageUrl)" [alt]="item.productName">
                <div class="restock-copy">
                  <div class="restock-head">
                    <strong>{{ item.productName }}</strong>
                    <span class="priority-pill" [class.critical]="item.priority === 'Critical'" [class.high]="item.priority === 'High'">
                      {{ getPriorityLabel(item.priority) }}
                    </span>
                  </div>
                  <div class="row-meta">
                    <span class="row-category">{{ item.category || translation.t('admin.unsorted') }}</span>
                    <span class="row-stock">{{ translation.t('admin.lowStock') }}: {{ item.currentStock }}</span>
                    <span class="row-supplier">{{ translation.t('admin.soldLast30Days') }}: {{ item.unitsSoldLast30Days }}</span>
                    <span class="row-cost">{{ translation.t('admin.reorderQty') }}: {{ item.recommendedQuantity }}</span>
                  </div>
                </div>
                <div class="restock-side">
                  <strong>\${{ item.estimatedCost | number:'1.0-0' }}</strong>
                  <span>{{ translation.t('admin.estimatedCost') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ng-template #noRestockState>
          <div class="glass empty-panel">
            {{ translation.t('admin.noRestockNeeded') }}
          </div>
        </ng-template>
      </section>

      <section *ngIf="activeTab === 'insights'" class="insights-section">
        <div class="header-action header-stack">
          <div>
            <h2>{{ translation.t('admin.storeInsights') }}</h2>
            <p class="section-subtitle">{{ translation.t('admin.storeInsightsCopy') }}</p>
          </div>
        </div>

        <div *ngIf="orders.length === 0" class="glass empty-panel">
          {{ translation.t('admin.noInsights') }}
        </div>

        <ng-container *ngIf="orders.length > 0">
          <div class="insight-kpis">
            <div class="glass insight-card">
              <span>KPI</span>
              <strong>\${{ totalRevenue | number:'1.0-0' }}</strong>
              <p>{{ translation.t('admin.kpis.totalRevenue') }}</p>
            </div>
            <div class="glass insight-card">
              <span>KPI</span>
              <strong>\${{ totalProfit | number:'1.0-0' }}</strong>
              <p>{{ translation.t('admin.kpis.grossProfit') }}</p>
            </div>
            <div class="glass insight-card">
              <span>KPI</span>
              <strong>\${{ averageOrderValue | number:'1.0-0' }}</strong>
              <p>{{ translation.t('admin.kpis.averageOrder') }}</p>
            </div>
            <div class="glass insight-card">
              <span>KPI</span>
              <strong>{{ deliveredOrdersCount }}</strong>
              <p>{{ translation.t('admin.kpis.deliveredOrders') }}</p>
            </div>
            <div class="glass insight-card">
              <span>KPI</span>
              <strong>{{ outOfStockProducts.length }}</strong>
              <p>{{ translation.t('admin.kpis.outOfStock') }}</p>
            </div>
            <div class="glass insight-card">
              <span>KPI</span>
              <strong>{{ profitMargin | number:'1.0-0' }}%</strong>
              <p>{{ translation.t('admin.kpis.margin') }}</p>
            </div>
          </div>

          <div class="insight-grid alert-grid">
            <article class="glass chart-card">
              <div class="card-header">
                <div>
                  <h3>{{ translation.t('admin.inventoryAlerts') }}</h3>
                  <p>{{ translation.t('admin.inventoryAlertsCopy') }}</p>
                </div>
              </div>

              <div class="inventory-alerts" *ngIf="lowStockProducts.length > 0; else healthyInventory">
                <div class="inventory-alert" *ngFor="let product of lowStockProducts">
                  <img [src]="getImgUrl(product.imageUrl)" [alt]="product.name">
                  <div class="inventory-copy">
                    <strong>{{ product.name }}</strong>
                    <span>{{ translation.t('admin.stockStatus.inStock', { count: product.stockQuantity || 0 }) }}</span>
                  </div>
                  <span class="inventory-badge" [class.danger]="isOutOfStock(product)">
                    {{ isOutOfStock(product) ? translation.t('admin.stockStatus.out') : translation.t('admin.stockStatus.low') }}
                  </span>
                </div>
              </div>

              <ng-template #healthyInventory>
                <div class="empty-inline">{{ translation.t('admin.inventoryHealthy') }}</div>
              </ng-template>
            </article>
          </div>

          <div class="insight-grid">
            <article class="glass chart-card trend-card">
              <div class="card-header">
                <div>
                  <h3>{{ translation.t('admin.revenueTrend') }}</h3>
                  <p>{{ translation.t('admin.revenueTrendCopy') }}</p>
                </div>
                <strong class="mini-highlight">\${{ deliveredRevenue | number:'1.0-0' }}</strong>
              </div>

              <div class="trend-chart">
                <svg viewBox="0 0 320 180" preserveAspectRatio="none" class="trend-svg">
                  <polyline class="trend-grid-line" points="0,145 320,145"></polyline>
                  <polyline class="trend-grid-line" points="0,105 320,105"></polyline>
                  <polyline class="trend-grid-line" points="0,65 320,65"></polyline>
                  <polygon class="trend-area" [attr.points]="trendAreaPoints"></polygon>
                  <polyline class="trend-line" [attr.points]="trendPolyline"></polyline>
                  <circle
                    *ngFor="let point of trendChartPoints"
                    class="trend-dot"
                    [attr.cx]="point.x"
                    [attr.cy]="point.y"
                    r="4">
                  </circle>
                </svg>

                <div class="trend-labels">
                  <div class="trend-label" *ngFor="let point of revenueTrend">
                    <strong>\${{ point.revenue | number:'1.0-0' }}</strong>
                    <span>{{ point.label }}</span>
                  </div>
                </div>
              </div>
            </article>

            <article class="glass chart-card status-card">
              <div class="card-header">
                <div>
                  <h3>{{ translation.t('admin.statusMix') }}</h3>
                  <p>{{ translation.t('admin.statusMixCopy') }}</p>
                </div>
              </div>

              <div class="status-layout">
                <div class="status-donut" [style.background]="statusRingBackground">
                  <div class="status-center">
                    <strong>{{ orders.length }}</strong>
                    <span>{{ translation.t('admin.orderCount') }}</span>
                  </div>
                </div>

                <div class="status-list">
                  <div class="status-item" *ngFor="let item of statusInsights">
                    <span class="status-swatch" [style.background]="item.color"></span>
                    <div class="status-copy">
                      <strong>{{ translation.t('status.' + item.label) }}</strong>
                      <span>{{ item.count }} {{ translation.t('admin.orderCount') }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article class="glass chart-card">
              <div class="card-header">
                <div>
                  <h3>{{ translation.t('admin.topProducts') }}</h3>
                  <p>{{ translation.t('admin.topProductsCopy') }}</p>
                </div>
              </div>

              <div class="top-product-list">
                <div class="top-product-row" *ngFor="let item of topProducts">
                  <img [src]="getImgUrl(item.imageUrl)" [alt]="item.name">
                  <div class="top-product-copy">
                    <div class="top-product-meta">
                      <strong>{{ item.name }}</strong>
                      <span>{{ item.units }} {{ translation.t('common.sold') }}</span>
                    </div>
                    <div class="product-bar">
                      <div class="product-bar-fill" [style.width.%]="getTopProductWidth(item.units)"></div>
                    </div>
                    <small>\${{ item.revenue | number:'1.0-0' }} revenue</small>
                  </div>
                </div>
              </div>
            </article>

            <article class="glass chart-card">
              <div class="card-header">
                <div>
                  <h3>{{ translation.t('admin.categoryPerformance') }}</h3>
                  <p>{{ translation.t('admin.categoryPerformanceCopy') }}</p>
                </div>
              </div>

              <div class="category-list">
                <div class="category-row" *ngFor="let category of categoryInsights">
                  <div class="category-head">
                    <strong>{{ category.label }}</strong>
                    <span>\${{ category.revenue | number:'1.0-0' }}</span>
                  </div>
                  <div class="product-bar">
                    <div class="product-bar-fill category-bar" [style.width.%]="getCategoryWidth(category.revenue)"></div>
                  </div>
                  <small>{{ category.units }} {{ translation.t('common.sold') }}</small>
                </div>
              </div>
            </article>

            <article class="glass chart-card">
              <div class="card-header">
                <div>
                  <h3>{{ translation.t('admin.supplierOverview') }}</h3>
                  <p>{{ translation.t('admin.supplierOverviewCopy') }}</p>
                </div>
              </div>

              <div class="supplier-list">
                <div class="supplier-row" *ngFor="let supplier of supplierInsights">
                  <div class="supplier-head">
                    <strong>{{ supplier.name }}</strong>
                    <span>\${{ supplier.stockValue | number:'1.0-0' }}</span>
                  </div>
                  <div class="product-bar">
                    <div class="product-bar-fill supplier-bar" [style.width.%]="getSupplierWidth(supplier.stockValue)"></div>
                  </div>
                  <small>{{ supplier.products }} {{ translation.t('common.productsSupplied') }}</small>
                </div>
              </div>
            </article>
          </div>
        </ng-container>
      </section>
    </div>
  `,
  styles: [`
    .navbar { position: fixed; top: 14px; left: 50%; transform: translateX(-50%); width: min(92%, 1200px); z-index: 1000; padding: 14px 22px; border-radius: 28px; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
    .logo { font-family: 'Outfit', sans-serif; font-size: 1.2rem; font-weight: 800; color: var(--primary-accent); }
    .nav-links { display: flex; gap: 14px; align-items: center; font-weight: 600; flex-wrap: wrap; justify-content: flex-end; min-width: 0; }
    .admin-container { padding-top: 120px; min-height: 100vh; padding-bottom: 50px; }
    .dashboard-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .stat-card { padding: 25px; text-align: center; border-radius: 20px; }
    .stat-value { font-size: 2.2rem; font-weight: 800; color: var(--primary-accent); margin: 10px 0 0; }
    .stat-accent { color: var(--secondary-accent); }
    .stat-success { color: #2ecc71; }
    .stat-warning { color: #f1c40f; }
    .tab-btn { background: none; border: none; color: var(--text-color); font-weight: 600; cursor: pointer; padding: 8px 15px; border-radius: 20px; transition: all 0.3s; opacity: 0.7; }
    .tab-btn.active { opacity: 1; background: rgba(255,255,255,0.1); color: var(--secondary-accent); }
    .header-action { display: flex; justify-content: space-between; align-items: center; gap: 18px; margin-bottom: 30px; }
    .header-stack { align-items: flex-start; }
    .section-subtitle { opacity: 0.72; margin: 8px 0 0; }
    .form-container { padding: 30px; margin-bottom: 30px; border: 1px solid var(--primary-accent); border-radius: 20px; }
    .field-group { display: grid; gap: 6px; margin-bottom: 14px; }
    .field-group label { font-weight: 700; }
    .field-group small, .file-upload-group small { opacity: 0.68; font-size: 0.83rem; margin-bottom: 4px; }
    .form-control { width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid var(--glass-border); border-radius: 10px; background: rgba(255,255,255,0.05); color: var(--text-color); }
    .file-input { padding: 8px; }
    .file-upload-group label { display: block; margin-bottom: 8px; font-weight: 600; }
    .img-preview { margin-top: 10px; display: flex; align-items: center; gap: 10px; }
    .img-preview img { width: 60px; height: 60px; border-radius: 10px; object-fit: cover; border: 1px solid var(--primary-accent); }
    .form-actions, .row-actions, .order-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .product-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 25px; border-radius: 15px; margin-bottom: 10px; gap: 18px; }
    .row-info { display: flex; align-items: center; gap: 15px; min-width: 0; flex: 1 1 auto; }
    .customer-avatar { width: 55px; height: 55px; border-radius: 50%; display: grid; place-items: center; background: linear-gradient(135deg, var(--primary-accent), var(--secondary-accent)); color: #fff; font-weight: 800; font-size: 1.2rem; }
    .row-img { width: 55px; height: 55px; border-radius: 10px; object-fit: cover; }
    .customer-row { align-items: center; }
    .customer-side { display: grid; gap: 6px; text-align: right; min-width: 110px; }
    .customer-side strong { color: var(--primary-accent); font-size: 1.1rem; }
    .customer-side span { opacity: 0.7; font-size: 0.85rem; }
    .supplier-groups { display: grid; gap: 18px; }
    .supplier-group { padding: 22px; border-radius: 24px; }
    .supplier-summary { display: flex; justify-content: space-between; gap: 16px; align-items: center; margin-bottom: 16px; }
    .supplier-summary h3 { margin: 0 0 6px; }
    .supplier-summary p { margin: 0; opacity: 0.7; }
    .supplier-summary strong { color: var(--primary-accent); }
    .restock-list { display: grid; gap: 12px; }
    .restock-row { display: grid; grid-template-columns: 56px 1fr auto; gap: 14px; align-items: center; padding: 12px 14px; border-radius: 18px; background: rgba(255,255,255,0.05); }
    .restock-row img { width: 56px; height: 56px; border-radius: 14px; object-fit: contain; background: rgba(255,255,255,0.04); padding: 6px; }
    .restock-copy { min-width: 0; }
    .restock-head { display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-bottom: 8px; }
    .restock-side { display: grid; gap: 4px; text-align: right; min-width: 120px; }
    .restock-side strong { color: var(--secondary-accent); }
    .restock-side span { opacity: 0.68; font-size: 0.8rem; }
    .priority-pill { padding: 6px 10px; border-radius: 999px; background: rgba(255,255,255,0.08); font-size: 0.78rem; font-weight: 700; }
    .priority-pill.high { background: rgba(241, 196, 15, 0.18); color: #f1c40f; }
    .priority-pill.critical { background: rgba(255, 107, 107, 0.16); color: #ff6b6b; }
    .row-name { font-weight: 700; word-break: break-word; }
    .row-meta { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-top: 4px; }
    .row-price { font-size: 0.9rem; color: var(--secondary-accent); font-weight: 600; }
    .row-category, .row-stock, .row-cost, .row-supplier { font-size: 0.78rem; padding: 4px 8px; border-radius: 999px; background: rgba(255,255,255,0.07); opacity: 0.8; }
    .row-cost { color: #7dd3fc; }
    .row-supplier { color: #d8b4fe; }
    .row-stock.warning { background: rgba(241, 196, 15, 0.16); color: #f1c40f; opacity: 1; }
    .row-stock.danger { background: rgba(255, 107, 107, 0.16); color: #ff6b6b; opacity: 1; }
    .order-row { padding: 20px; border-radius: 20px; margin-bottom: 15px; }
    .order-header { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; }
    .order-id { font-weight: 800; font-size: 1.1rem; }
    .order-status { font-weight: 800; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px; }
    .order-details { font-size: 0.95rem; opacity: 0.8; line-height: 1.6; margin-bottom: 15px; }
    .order-items-preview { display: grid; gap: 10px; margin-bottom: 16px; }
    .order-item-chip { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 16px; background: rgba(255,255,255,0.05); }
    .order-item-chip img { width: 44px; height: 44px; object-fit: contain; border-radius: 12px; background: rgba(255,255,255,0.04); padding: 4px; }
    .order-item-chip strong, .order-item-chip span { display: block; }
    .order-item-chip span { opacity: 0.7; font-size: 0.85rem; }
    .order-footer { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding-top: 15px; border-top: 1px dotted rgba(255,255,255,0.1); }
    .order-amount { font-size: 1.4rem; font-weight: 800; color: var(--secondary-accent); }
    .empty-state, .empty-panel { text-align: center; padding: 60px; opacity: 0.55; font-style: italic; border-radius: 24px; }
    .pagination { display: flex; justify-content: center; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
    .page-btn { min-width: 42px; padding: 10px 14px; border-radius: 999px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.06); color: var(--text-color); cursor: pointer; }
    .page-btn.active { background: var(--primary-accent); color: #fff; border-color: transparent; }
    .page-btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn { cursor: pointer; border-radius: 10px; border: none; font-weight: 600; transition: transform 0.2s; padding: 10px 16px; }
    .btn:active { transform: scale(0.95); }
    .primary-btn, .action-btn { background: var(--primary-accent); color: #fff; }
    .logout-btn { background: #ff4757; color: white; }
    .cancel-btn { background: transparent; border: 1px solid var(--glass-border); color: var(--text-color); }
    .deliver-btn { background: #2ecc71; }
    .return-btn { background: linear-gradient(135deg, #8f7cff, #5f7cff); color: #fff; }
    .edit-btn { background: rgba(255,255,255,0.08); color: var(--text-color); }
    .delete-btn { background: #ff4757; color: white; }
    .insight-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 18px; margin-bottom: 24px; }
    .insight-card { padding: 22px; border-radius: 22px; }
    .insight-card span { opacity: 0.65; text-transform: uppercase; letter-spacing: 0.16em; font-size: 0.72rem; }
    .insight-card strong { display: block; font-size: 2rem; margin: 10px 0 8px; color: var(--primary-accent); }
    .insight-card p { margin: 0; opacity: 0.78; }
    .insight-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
    .alert-grid { margin-bottom: 20px; }
    .chart-card { padding: 24px; border-radius: 24px; min-height: 100%; }
    .card-header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin-bottom: 20px; }
    .card-header h3 { margin: 0 0 8px; }
    .card-header p { margin: 0; opacity: 0.7; }
    .mini-highlight { color: var(--secondary-accent); font-size: 1.2rem; }
    .trend-card { overflow: hidden; }
    .trend-chart { display: grid; gap: 18px; }
    .trend-svg { width: 100%; height: 200px; }
    .trend-grid-line { fill: none; stroke: rgba(255,255,255,0.08); stroke-width: 1; stroke-dasharray: 4 6; }
    .trend-area { fill: rgba(155, 142, 199, 0.16); }
    .trend-line { fill: none; stroke: var(--primary-accent); stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
    .trend-dot { fill: var(--secondary-accent); }
    .trend-labels { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; }
    .trend-label { text-align: center; }
    .trend-label strong { display: block; font-size: 0.85rem; }
    .trend-label span { font-size: 0.78rem; opacity: 0.68; }
    .status-layout { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
    .status-donut { width: 190px; height: 190px; border-radius: 50%; display: grid; place-items: center; margin: 0 auto; }
    .status-center { width: 108px; height: 108px; border-radius: 50%; background: rgba(10, 14, 26, 0.92); display: grid; place-items: center; text-align: center; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05); }
    .status-center strong { display: block; font-size: 1.8rem; color: var(--primary-accent); }
    .status-center span { font-size: 0.85rem; opacity: 0.7; }
    :host-context(body:not(.dark)) .status-center { background: rgba(255,255,255,0.9); }
    .status-list { display: grid; gap: 12px; flex: 1; min-width: 220px; }
    .status-item { display: flex; align-items: center; gap: 12px; }
    .status-swatch { width: 12px; height: 12px; border-radius: 50%; }
    .status-copy strong, .status-copy span { display: block; }
    .status-copy span { opacity: 0.7; font-size: 0.84rem; }
    .top-product-list, .category-list, .supplier-list { display: grid; gap: 16px; }
    .inventory-alerts { display: grid; gap: 12px; }
    .inventory-alert { display: grid; grid-template-columns: 52px 1fr auto; gap: 12px; align-items: center; padding: 12px 14px; border-radius: 18px; background: rgba(255,255,255,0.05); }
    .inventory-alert img { width: 52px; height: 52px; border-radius: 14px; object-fit: contain; background: rgba(255,255,255,0.04); padding: 6px; }
    .inventory-copy strong, .inventory-copy span { display: block; }
    .inventory-copy span { opacity: 0.7; font-size: 0.84rem; }
    .inventory-badge { min-width: 52px; text-align: center; padding: 6px 10px; border-radius: 999px; background: rgba(241, 196, 15, 0.18); color: #f1c40f; font-weight: 700; }
    .inventory-badge.danger { background: rgba(255, 107, 107, 0.16); color: #ff6b6b; }
    .empty-inline { opacity: 0.68; padding: 18px 0 6px; }
    .top-product-row { display: grid; grid-template-columns: 54px 1fr; gap: 14px; align-items: center; }
    .top-product-row img { width: 54px; height: 54px; border-radius: 14px; object-fit: contain; background: rgba(255,255,255,0.04); padding: 6px; }
    .top-product-meta, .category-head { display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-bottom: 8px; }
    .supplier-head { display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-bottom: 8px; }
    .top-product-meta span, .category-head span, .supplier-head span, .top-product-copy small, .category-row small, .supplier-row small { opacity: 0.72; }
    .product-bar { height: 10px; border-radius: 999px; background: rgba(255,255,255,0.08); overflow: hidden; margin-bottom: 8px; }
    .product-bar-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--primary-accent), var(--secondary-accent)); }
    .category-bar { background: linear-gradient(90deg, #4facfe, #9b8ec7); }
    .supplier-bar { background: linear-gradient(90deg, #34d399, #60a5fa); }
    @media (max-width: 980px) {
      .insight-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 900px) {
      .navbar { align-items: flex-start; }
      .nav-links { justify-content: flex-start; }
      .product-row, .supplier-summary, .restock-row, .inventory-alert, .top-product-row { align-items: flex-start; }
      .customer-side, .restock-side { text-align: left; min-width: 0; }
    }
    @media (max-width: 768px) {
      .navbar { position: static; transform: none; width: 100%; margin-bottom: 18px; border-radius: 24px; flex-direction: column; align-items: stretch; padding: 16px; }
      .logo { text-align: center; }
      .nav-links { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
      .nav-links > * { width: 100%; min-height: 44px; text-align: center; }
      .admin-container { padding-top: 20px; padding-bottom: 32px; }
      .dashboard-stats, .insight-kpis { grid-template-columns: 1fr; gap: 14px; margin-bottom: 24px; }
      .header-action { flex-direction: column; align-items: stretch; }
      .product-row, .order-footer, .order-header, .card-header, .supplier-summary, .restock-head, .top-product-meta, .category-head, .supplier-head { flex-direction: column; align-items: stretch; }
      .row-info, .order-item-chip { align-items: flex-start; }
      .row-actions, .order-actions, .customer-side { width: 100%; }
      .row-actions .btn, .order-actions .btn { flex: 1; }
      .order-row, .product-row, .form-container, .chart-card, .supplier-group, .stat-card, .insight-card { padding: 16px; }
      .restock-row, .inventory-alert, .top-product-row { grid-template-columns: 1fr; }
      .restock-row img, .inventory-alert img, .top-product-row img { width: 64px; height: 64px; }
      .restock-side { text-align: left; }
      .empty-state, .empty-panel { padding: 32px 18px; }
      .pagination { justify-content: stretch; }
      .page-btn { flex: 1 1 calc(50% - 10px); }
      .status-layout { justify-content: center; }
      .status-list { min-width: 0; width: 100%; }
      .trend-svg { height: 180px; }
      .trend-labels { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 520px) {
      .navbar { padding: 14px; }
      .nav-links { grid-template-columns: 1fr; }
      .dashboard-stats { gap: 12px; }
      .row-meta { gap: 8px; }
      .row-category, .row-stock, .row-cost, .row-supplier { width: 100%; text-align: center; }
      .order-amount { font-size: 1.2rem; }
      .pagination { gap: 8px; }
      .page-btn { flex-basis: 100%; }
    }
  `]
})
export class AdminComponent implements OnInit {
  products: Product[] = [];
  orders: Order[] = [];
  customers: AdminCustomer[] = [];
  restockSuggestions: RestockSuggestion[] = [];
  activeTab: AdminTab = 'products';
  showForm = false;
  isEditing = false;
  currentProduct: Product = { name: '', description: '', price: 0, costPrice: 0, supplier: '', category: 'Summer', stockQuantity: 0 };
  selectedFile: File | null = null;
  currentPage = 1;
  ordersPage = 1;
  readonly pageSize = 10;
  private http = inject(HttpClient);

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    public translation: TranslationService
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (!this.authService.isAuthenticated() || currentUser?.role !== 'Admin') {
      this.router.navigate(['/login']);
      return;
    }

    this.loadProducts();
    this.loadOrders();
    this.loadCustomers();
    this.loadRestockSuggestions();
  }

  get pagedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.products.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.products.length / this.pageSize));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  get pagedOrders(): Order[] {
    const start = (this.ordersPage - 1) * this.pageSize;
    return this.orders.slice(start, start + this.pageSize);
  }

  get ordersTotalPages(): number {
    return Math.max(1, Math.ceil(this.orders.length / this.pageSize));
  }

  get orderPages(): number[] {
    return Array.from({ length: this.ordersTotalPages }, (_, index) => index + 1);
  }

  get totalRevenue(): number {
    return this.orders.reduce((sum, order) => sum + order.totalAmount, 0);
  }

  get totalProfit(): number {
    const costs = this.getProductCostLookup();
    return this.orders.reduce((sum, order) => (
      sum + order.items.reduce((itemSum, item) => {
        const unitCost = costs.get(item.productId) ?? 0;
        return itemSum + ((item.unitPrice - unitCost) * item.quantity);
      }, 0)
    ), 0);
  }

  get averageOrderValue(): number {
    return this.orders.length ? this.totalRevenue / this.orders.length : 0;
  }

  get totalCustomers(): number {
    return this.customers.filter(customer => customer.role !== 'Admin').length;
  }

  get groupedRestockSuggestions(): Array<{ supplier: string; items: RestockSuggestion[]; totalEstimatedCost: number }> {
    const grouped = new Map<string, { supplier: string; items: RestockSuggestion[]; totalEstimatedCost: number }>();

    for (const item of this.restockSuggestions) {
      const existing = grouped.get(item.supplier) ?? {
        supplier: item.supplier,
        items: [],
        totalEstimatedCost: 0
      };
      existing.items.push(item);
      existing.totalEstimatedCost += item.estimatedCost;
      grouped.set(item.supplier, existing);
    }

    return [...grouped.values()].sort((a, b) => b.totalEstimatedCost - a.totalEstimatedCost);
  }

  get profitMargin(): number {
    return this.totalRevenue > 0 ? (this.totalProfit / this.totalRevenue) * 100 : 0;
  }

  get deliveredRevenue(): number {
    return this.orders
      .filter(order => order.status === 'Delivered')
      .reduce((sum, order) => sum + order.totalAmount, 0);
  }

  get deliveredOrdersCount(): number {
    return this.orders.filter(order => order.status === 'Delivered').length;
  }

  get pendingOrdersCount(): number {
    return this.orders.filter(order => order.status !== 'Delivered').length;
  }

  get revenueTrend(): TrendPoint[] {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setHours(0, 0, 0, 0);
      date.setDate(today.getDate() - (6 - index));
      return {
        key: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: 0,
        orders: 0
      };
    });

    const map = new Map(days.map(day => [day.key, day]));
    for (const order of this.orders) {
      if (!order.orderDate) {
        continue;
      }

      const key = new Date(order.orderDate).toISOString().slice(0, 10);
      const bucket = map.get(key);
      if (!bucket) {
        continue;
      }

      bucket.revenue += order.totalAmount;
      bucket.orders += 1;
    }

    return days;
  }

  get trendChartPoints(): Array<{ x: number; y: number }> {
    const width = 320;
    const height = 180;
    const leftPad = 18;
    const rightPad = 18;
    const topPad = 18;
    const bottomPad = 20;
    const maxRevenue = Math.max(...this.revenueTrend.map(point => point.revenue), 1);
    const usableWidth = width - leftPad - rightPad;
    const usableHeight = height - topPad - bottomPad;

    return this.revenueTrend.map((point, index) => {
      const x = leftPad + (usableWidth * index) / Math.max(this.revenueTrend.length - 1, 1);
      const y = topPad + usableHeight - (point.revenue / maxRevenue) * usableHeight;
      return { x, y };
    });
  }

  get trendPolyline(): string {
    return this.trendChartPoints.map(point => `${point.x},${point.y}`).join(' ');
  }

  get trendAreaPoints(): string {
    const points = this.trendChartPoints;
    if (points.length === 0) {
      return '';
    }

    return [
      `18,160`,
      ...points.map(point => `${point.x},${point.y}`),
      `${points[points.length - 1].x},160`
    ].join(' ');
  }

  get statusInsights(): StatusInsight[] {
    const statuses: Array<{ label: string; color: string }> = [
      { label: 'Pending', color: '#f1c40f' },
      { label: 'Shipped', color: '#3498db' },
      { label: 'Delivered', color: '#2ecc71' },
      { label: 'ReturnRequested', color: '#8f7cff' },
      { label: 'Refunded', color: '#57d8a3' },
      { label: 'Cancelled', color: '#ff6b6b' }
    ];

    return statuses
      .map(status => ({
        ...status,
        count: this.orders.filter(order => order.status === status.label).length
      }))
      .filter(status => status.count > 0);
  }

  get statusRingBackground(): string {
    if (this.orders.length === 0) {
      return 'conic-gradient(rgba(255,255,255,0.08) 0deg 360deg)';
    }

    let currentAngle = 0;
    const segments = this.statusInsights.map(status => {
      const slice = (status.count / this.orders.length) * 360;
      const start = currentAngle;
      currentAngle += slice;
      return `${status.color} ${start}deg ${currentAngle}deg`;
    });

    return `conic-gradient(${segments.join(', ')})`;
  }

  get topProducts(): TopProductInsight[] {
    const productMap = new Map<number, TopProductInsight>();

    for (const item of this.orders.flatMap(order => order.items ?? [])) {
      const existing = productMap.get(item.productId) ?? {
        name: item.productName,
        units: 0,
        revenue: 0,
        imageUrl: item.productImageUrl
      };

      existing.units += item.quantity;
      existing.revenue += item.quantity * item.unitPrice;
      if (!existing.imageUrl) {
        existing.imageUrl = item.productImageUrl;
      }

      productMap.set(item.productId, existing);
    }

    return [...productMap.values()]
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);
  }

  get categoryInsights(): CategoryInsight[] {
    const productCategories = new Map<number, string>(
      this.products
        .filter(product => product.id)
        .map(product => [product.id!, product.category?.trim() || 'Other'])
    );

    const totals = new Map<string, CategoryInsight>();

    for (const item of this.orders.flatMap(order => order.items ?? [])) {
      const label = productCategories.get(item.productId) || 'Other';
      const current = totals.get(label) ?? { label, revenue: 0, units: 0 };
      current.units += item.quantity;
      current.revenue += item.quantity * item.unitPrice;
      totals.set(label, current);
    }

    return [...totals.values()].sort((a, b) => b.revenue - a.revenue);
  }

  get supplierInsights(): SupplierInsight[] {
    const totals = new Map<string, SupplierInsight>();

    for (const product of this.products) {
      const name = product.supplier?.trim() || this.translation.t('admin.unassignedSupplier');
      const current = totals.get(name) ?? { name, products: 0, stockValue: 0 };
      current.products += 1;
      current.stockValue += (product.costPrice ?? 0) * (product.stockQuantity ?? 0);
      totals.set(name, current);
    }

    return [...totals.values()].sort((a, b) => b.stockValue - a.stockValue);
  }

  get lowStockProducts(): Product[] {
    return this.products
      .filter(product => (product.stockQuantity ?? 0) <= 5)
      .sort((a, b) => (a.stockQuantity ?? 0) - (b.stockQuantity ?? 0));
  }

  get outOfStockProducts(): Product[] {
    return this.products.filter(product => (product.stockQuantity ?? 0) <= 0);
  }

  loadProducts() {
    this.productService.getProducts().subscribe(data => {
      this.products = [...data].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
      this.currentPage = Math.min(this.currentPage, this.totalPages);
    });
  }

  loadOrders() {
    this.orderService.getOrders().subscribe(data => {
      this.orders = [...data].sort((a, b) => new Date(b.orderDate ?? 0).getTime() - new Date(a.orderDate ?? 0).getTime());
      this.ordersPage = Math.min(this.ordersPage, this.ordersTotalPages);
    });
  }

  loadCustomers() {
    this.http.get<AdminCustomer[]>(apiUrl('/api/auth/users'), {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).subscribe(data => {
      this.customers = data.filter(customer => customer.role !== 'Admin');
    });
  }

  loadRestockSuggestions() {
    this.http.get<RestockSuggestion[]>(apiUrl('/api/inventory/restock-suggestions'), {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).subscribe(data => {
      this.restockSuggestions = data;
    });
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
  }

  changeOrdersPage(page: number) {
    if (page < 1 || page > this.ordersTotalPages) {
      return;
    }

    this.ordersPage = page;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  getImgUrl(url: string | undefined): string {
    if (!url) return 'assets/images/placeholder.png';
    if (url.startsWith('http') || url.startsWith('assets/')) return url;
    return assetUrl(url);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Pending': return '#f1c40f';
      case 'Shipped': return '#3498db';
      case 'Delivered': return '#2ecc71';
      case 'ReturnRequested': return '#8f7cff';
      case 'Refunded': return '#57d8a3';
      case 'Cancelled': return '#ff6b6b';
      default: return '#fff';
    }
  }

  getPriorityLabel(priority: string): string {
    switch (priority) {
      case 'Critical':
        return this.translation.t('admin.priorityCritical');
      case 'High':
        return this.translation.t('admin.priorityHigh');
      default:
        return this.translation.t('admin.priorityNormal');
    }
  }

  getTopProductWidth(units: number): number {
    const maxUnits = Math.max(...this.topProducts.map(item => item.units), 1);
    return (units / maxUnits) * 100;
  }

  getCategoryWidth(revenue: number): number {
    const maxRevenue = Math.max(...this.categoryInsights.map(item => item.revenue), 1);
    return (revenue / maxRevenue) * 100;
  }

  getSupplierWidth(stockValue: number): number {
    const maxValue = Math.max(...this.supplierInsights.map(item => item.stockValue), 1);
    return (stockValue / maxValue) * 100;
  }

  isLowStock(product: Product): boolean {
    return (product.stockQuantity ?? 0) > 0 && (product.stockQuantity ?? 0) <= 5;
  }

  isOutOfStock(product: Product): boolean {
    return (product.stockQuantity ?? 0) <= 0;
  }

  getStockLabel(product: Product): string {
    if (this.isOutOfStock(product)) {
      return this.translation.t('admin.stockStatus.outOfStock');
    }

    return this.translation.t('admin.stockStatus.inStock', { count: product.stockQuantity ?? 0 });
  }

  private getProductCostLookup(): Map<number, number> {
    return new Map(
      this.products
        .filter(product => product.id)
        .map(product => [product.id!, product.costPrice ?? 0])
    );
  }

  updateOrderStatus(id: number, status: string) {
    this.orderService.updateOrderStatus(id, status).subscribe(() => {
      this.loadOrders();
      this.loadProducts();
      this.loadCustomers();
      this.loadRestockSuggestions();
    });
  }

  saveProduct() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      this.http.post<any>(apiUrl('/api/uploads'), formData).subscribe({
        next: response => {
          this.currentProduct.imageUrl = response.url ?? response.Url;
          this.completeProductSave();
        },
        error: () => this.toastService.show(this.translation.t('admin.actions.uploadFailed'), 'error')
      });
      return;
    }

    this.completeProductSave();
  }

  private completeProductSave() {
    if (this.isEditing && this.currentProduct.id) {
      this.productService.updateProduct(this.currentProduct.id, this.currentProduct).subscribe({
        next: () => {
          this.loadProducts();
          this.cancelForm();
          this.toastService.show(this.translation.t('admin.actions.updateSuccess'), 'success');
        },
        error: () => this.toastService.show(this.translation.t('admin.actions.updateFailed'), 'error')
      });
      return;
    }

    this.productService.createProduct(this.currentProduct).subscribe({
      next: () => {
        this.loadProducts();
        this.cancelForm();
        this.currentPage = 1;
        this.toastService.show(this.translation.t('admin.actions.createSuccess'), 'success');
      },
      error: () => this.toastService.show(this.translation.t('admin.actions.createFailed'), 'error')
    });
  }

  editProduct(product: Product) {
    this.currentProduct = { ...product };
    this.isEditing = true;
    this.showForm = true;
  }

  deleteProduct(id: number) {
    if (!confirm(this.translation.t('admin.actions.confirmDelete'))) {
      return;
    }

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.loadProducts();
        this.toastService.show(this.translation.t('admin.actions.deleteSuccess'), 'success');
      },
      error: () => this.toastService.show(this.translation.t('admin.actions.deleteFailed'), 'error')
    });
  }

  cancelForm() {
    this.showForm = false;
    this.isEditing = false;
    this.currentProduct = { name: '', description: '', price: 0, costPrice: 0, supplier: '', category: 'Summer', stockQuantity: 0 };
    this.selectedFile = null;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
