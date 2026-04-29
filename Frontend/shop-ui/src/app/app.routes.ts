import { Routes } from '@angular/router';
import { authGuard, staffGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Moon Store | Premium Streetwear Collection',
    data: {
      description: 'Shop premium streetwear, hoodies, sneakers, and seasonal collections at Moon Store.'
    },
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    title: 'Login | Moon Store',
    data: { description: 'Login to your Moon Store account to manage cart, favorites, and orders.' },
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    canActivate: [staffGuard],
    title: 'Dashboard | Moon Store',
    data: { description: 'Moon Store selling operations dashboard for products, orders, and branch moderators.' },
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent)
  },
  {
    path: 'register',
    title: 'Create Account | Moon Store',
    data: { description: 'Create a Moon Store account to save favorites, build a cart, and track orders.' },
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    title: 'Forgot Password | Moon Store',
    data: { description: 'Reset access to your Moon Store account.' },
    loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    title: 'Reset Password | Moon Store',
    data: { description: 'Choose a new password for your Moon Store account.' },
    loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'product/:id',
    title: 'Product Details | Moon Store',
    data: { description: 'View product details, stock, sizes, colors, and availability at Moon Store.' },
    loadComponent: () => import('./pages/product-details/product-details.component').then(m => m.ProductDetailsComponent)
  },
  {
    path: 'favourites',
    canActivate: [authGuard],
    title: 'Favorites | Moon Store',
    data: { description: 'Review your saved Moon Store favorite products.' },
    loadComponent: () => import('./pages/favourites/favourites.component').then(m => m.FavouritesComponent)
  },
  {
    path: 'cart',
    canActivate: [authGuard],
    title: 'Cart | Moon Store',
    data: { description: 'Review your Moon Store cart before checkout.' },
    loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'shipping',
    canActivate: [authGuard],
    title: 'Checkout | Moon Store',
    data: { description: 'Enter delivery details and confirm your Moon Store order.' },
    loadComponent: () => import('./pages/shipping/shipping.component').then(m => m.ShippingComponent)
  },
  {
    path: 'my-orders',
    canActivate: [authGuard],
    title: 'My Orders | Moon Store',
    data: { description: 'Track your Moon Store orders and order statuses.' },
    loadComponent: () => import('./pages/my-orders/my-orders.component').then(m => m.MyOrdersComponent)
  },
  {
    path: 'trust',
    title: 'Shipping, Returns & Contact | Moon Store',
    data: { description: 'Moon Store shipping information, return policy, privacy note, and WhatsApp contact.' },
    loadComponent: () => import('./pages/trust/trust.component').then(m => m.TrustComponent)
  },
  { path: '**', redirectTo: '' }
];
