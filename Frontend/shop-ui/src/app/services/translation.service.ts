import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppLanguage = 'en' | 'ar';

type TranslationTree = {
  [key: string]: string | TranslationTree;
};

const translations: Record<AppLanguage, TranslationTree> = {
  en: {
    nav: {
      brand: 'Moon Store',
      home: 'Home',
      favourites: 'Favourites',
      cart: 'Cart',
      login: 'Login',
      myOrders: 'My Orders',
      dashboard: 'Dashboard',
      logout: 'Logout',
      switchToLight: 'Switch to light mode',
      switchToDark: 'Switch to dark mode',
      toggleMenu: 'Toggle navigation menu'
    },
    common: {
      backToHome: 'Back to Home',
      save: 'Save',
      cancel: 'Cancel',
      remove: 'Remove',
      edit: 'Edit',
      removeAll: 'Remove All',
      proceedToPayment: 'Proceed to Payment',
      addToCart: 'Add to Cart',
      noData: 'No data yet.',
      previous: 'Prev',
      next: 'Next',
      customer: 'Customer',
      address: 'Address',
      date: 'Date',
      sold: 'sold',
      productsSupplied: 'products supplied'
    },
    home: {
      heroLabel: 'Moon Store',
      heroTitleLine1: 'Elevate Your',
      heroTitleAccent: 'Streetwear',
      heroSubtitle: 'Discover premium, trendy clothing curated for the modern era. Hand-picked 3D animated collections designed for impact.',
      heroButton: 'Explore Collection',
      winterLabel: 'Cold Weather Edit',
      winterTitle: 'Winter Collection',
      summerLabel: 'Heat Ready Picks',
      summerTitle: 'Summer Collection',
      footerOwner: 'Designed and maintained by MohamedHamed',
      footerCopy: 'All rights reserved to M.Hamed'
    },
    login: {
      title: 'Login',
      username: 'Username',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      registerPrompt: "Don't have an account? Register",
      submit: 'Login',
      invalidCredentials: 'Invalid credentials',
      success: 'Logged in successfully',
      hidePassword: 'Hide password',
      showPassword: 'Show password'
    },
    register: {
      title: 'Create Account',
      username: 'Username',
      email: 'Email',
      phone: 'Phone Number (Optional)',
      password: 'Password',
      submit: 'Register',
      loginPrompt: 'Already have an account? Login',
      success: 'Registration successful! Redirecting...',
      failed: 'Registration failed. Username might exist.',
      hidePassword: 'Hide password',
      showPassword: 'Show password'
    },
    forgot: {
      title: 'Forgot Password',
      email: 'Email',
      submit: 'Get OTP',
      backToLogin: 'Back to Login',
      processingError: 'Error processing request',
      mockSent: 'Mock Email Sent!',
      checking: 'Checking...',
      enterEmail: 'Please enter your email.',
      otpIntro: 'Your reset OTP is:',
      otpHint: 'It expires in {{ minutes }} minutes. Enter it on the next page.',
      continueReset: 'Continue to reset password',
      otpGenerated: 'OTP generated.'
    },
    reset: {
      title: 'Reset Password',
      email: 'Email',
      otp: 'OTP',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      submit: 'Reset Password',
      resetting: 'Resetting...',
      failed: 'Reset failed',
      enterEmail: 'Please enter your email.',
      enterOtp: 'Please enter the OTP.',
      passwordMin: 'Password must be at least 6 characters.',
      passwordMismatch: 'Passwords do not match.'
    },
    favourites: {
      title: 'Your Favourites',
      empty: "You haven't added any favorites yet.",
      remove: 'Remove',
      addToCart: 'Add to Cart',
      added: 'Added to cart!',
      loginFirst: 'Please login first to add to cart.'
    },
    cart: {
      title: 'Your Cart',
      empty: 'Your cart is empty.',
      total: 'Total',
      proceed: 'Proceed to Payment',
      errors: {
        outOfStock: 'This product is out of stock.',
        noMoreStock: 'No more stock is available for this item.',
        stockExceeded: 'Requested quantity exceeds available stock.'
      }
    },
    product: {
      addToCart: 'Add to Cart',
      addedToCart: 'Added to cart!',
      loginCart: 'Please login first to add to cart.',
      updatedFavourites: 'Updated favourites!',
      loginFav: 'Please login first to update favourites.',
      loginRequired: 'Please login first.',
      outOfStock: 'Out of stock',
      inStock: 'In stock',
      inStockCount: '{{count}} in stock'
    },
    shipping: {
      eyebrow: 'Galaxy Delivery',
      title: 'From lunar warehouse to your doorstep, with tracked delivery details locked in.',
      subtitle: 'Fill in every shipping field so your order can be dispatched without delays or follow-up calls.',
      heading: 'Shipping Details',
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone Number',
      city: 'City',
      area: 'Area',
      street: 'Street Address',
      apartment: 'Building / Apartment',
      postal: 'Postal Code',
      orderTotal: 'Order Total',
      confirm: 'Confirm Delivery',
      successTitle: 'Order Confirmed',
      successText: 'Your delivery details were saved and your order is now in the dashboard queue.',
      returnToStore: 'Return to Store',
      errors: {
        fullName: 'Enter your full name.',
        email: 'Enter a valid email address.',
        phone: 'Enter a valid phone number.',
        city: 'City is required.',
        area: 'Area is required.',
        street: 'Street address is required.',
        apartment: 'Building or apartment is required.',
        postal: 'Enter a valid postal code.',
        complete: 'Please complete all shipping details.',
        emptyCart: 'Your cart is empty.',
        createFailed: 'Could not create the order.'
      }
    },
    myOrders: {
      eyebrow: 'Live Tracking',
      title: 'My Orders',
      subtitle: 'Track every stage of your delivery and preview the products inside each order.',
      empty: 'No orders yet. Once you complete checkout, your orders will appear here.',
      qtyPrice: 'Qty {{quantity}} • ${{price}}',
      cancel: 'Cancel Order',
      requestReturn: 'Request Return',
      actions: {
        cancelSuccess: 'Order cancelled successfully.',
        returnRequested: 'Return request sent successfully.',
        cancelFailed: 'Could not cancel this order.',
        returnFailed: 'Could not request a return.'
      }
    },
    admin: {
      title: 'Moon Store Admin',
      products: 'Products',
      orders: 'Orders',
      customers: 'Customers',
      purchaseOrders: 'Purchase Orders',
      insights: 'Insights',
      shopHome: 'Shop Home',
      addProduct: 'Add New Product',
      productManagement: 'Product Management',
      editProduct: 'Edit Product',
      addNewProduct: 'Add Product',
      fields: {
        name: 'Name',
        description: 'Description',
        price: 'Price',
        costPrice: 'Cost Price',
        supplier: 'Supplier',
        stockQuantity: 'Stock Quantity',
        category: 'Category',
        image: 'Product Image'
      },
      fieldHelp: {
        name: 'The customer-facing product name shown on cards and detail pages.',
        description: 'A short summary describing the product style, material, or use.',
        price: 'The selling price shown to customers in the store.',
        costPrice: 'Your internal cost for buying or producing one item.',
        supplier: 'The supplier or company providing this product.',
        stockQuantity: 'How many units are currently available in inventory.',
        category: 'Choose which collection this product belongs to in the home page.',
        image: 'Upload the main product image that appears in the store.'
      },
      winter: 'Winter Collection',
      summer: 'Summer Collection',
      currentImage: 'Current image set',
      totalProducts: 'Total Products',
      totalOrders: 'Total Orders',
      revenue: 'Revenue',
      lowStock: 'Low Stock',
      realtimeOrders: 'Real-time Order Tracking',
      trackOrders: 'Track every order from checkout to delivery.',
      noOrders: 'No orders found yet.',
      customerManagement: 'Customer Management',
      customerManagementCopy: 'Track customer activity, order history, and high-value shoppers.',
      noCustomers: 'No customers found yet.',
      customersCount: 'Customers',
      totalSpent: 'Total spent',
      latestOrder: 'Latest order',
      noPhone: 'No phone',
      noEmail: 'No email',
      restockPlanning: 'Restock Planning',
      restockPlanningCopy: 'Live supplier-based suggestions for low-stock products and upcoming purchase orders.',
      noRestockNeeded: 'Inventory looks strong. No restock suggestions right now.',
      reorderQty: 'Reorder qty',
      soldLast30Days: 'Sold in 30 days',
      estimatedCost: 'Estimated cost',
      priority: 'Priority',
      supplierTotal: 'Supplier total',
      priorityCritical: 'Critical',
      priorityHigh: 'High',
      priorityNormal: 'Normal',
      markShipped: 'Mark Shipped',
      markDelivered: 'Mark Delivered',
      markCancelled: 'Cancel Order',
      approveRefund: 'Approve Refund',
      rejectReturn: 'Reject Return',
      storeInsights: 'Store Insights',
      storeInsightsCopy: 'A live operational snapshot of revenue, order flow, and product performance.',
      noInsights: 'Add some orders and this view will start showing revenue trends, status splits, and top-performing products.',
      kpis: {
        totalRevenue: 'Total revenue collected',
        grossProfit: 'Estimated gross profit',
        averageOrder: 'Average order value',
        deliveredOrders: 'Delivered orders',
        outOfStock: 'Out-of-stock products',
        margin: 'Estimated gross margin'
      },
      inventoryAlerts: 'Inventory Alerts',
      inventoryAlertsCopy: 'Products that need restocking soon',
      inventoryHealthy: 'Inventory levels look healthy right now.',
      revenueTrend: 'Revenue Trend',
      revenueTrendCopy: 'Last 7 days of order revenue',
      statusMix: 'Order Status Mix',
      statusMixCopy: 'Where current orders are sitting right now',
      topProducts: 'Top Products',
      topProductsCopy: 'Best sellers by units sold',
      categoryPerformance: 'Category Performance',
      categoryPerformanceCopy: 'Revenue and movement across shop collections',
      supplierOverview: 'Supplier Overview',
      supplierOverviewCopy: 'Supplier footprint based on live catalog value',
      orderCount: 'Orders',
      unsorted: 'Unsorted',
      noSupplier: 'No supplier',
      unassignedSupplier: 'Unassigned supplier',
      stockStatus: {
        out: 'Out',
        low: 'Low',
        outOfStock: 'Out of stock',
        inStock: '{{count}} in stock'
      },
      actions: {
        updateSuccess: 'Product updated successfully.',
        createSuccess: 'Product added successfully.',
        deleteSuccess: 'Product deleted successfully.',
        uploadFailed: 'Image upload failed.',
        updateFailed: 'Could not update the product.',
        createFailed: 'Could not create the product.',
        deleteFailed: 'Could not delete the product.',
        confirmDelete: 'Are you sure?'
      }
    },
    status: {
      Pending: 'Pending',
      Shipped: 'Shipped',
      Delivered: 'Delivered',
      Cancelled: 'Cancelled',
      ReturnRequested: 'Return Requested',
      Refunded: 'Refunded'
    },
    toast: {
      logout: 'Logged out successfully',
      welcome: 'Welcome, {{name}}!'
    }
  },
  ar: {
    nav: {
      brand: 'مون ستور',
      home: 'الرئيسية',
      favourites: 'المفضلة',
      cart: 'السلة',
      login: 'تسجيل الدخول',
      myOrders: 'طلباتي',
      dashboard: 'لوحة التحكم',
      logout: 'تسجيل الخروج',
      switchToLight: 'التبديل إلى الوضع الفاتح',
      switchToDark: 'التبديل إلى الوضع الداكن',
      toggleMenu: 'فتح أو إغلاق القائمة'
    },
    common: {
      backToHome: 'العودة للرئيسية',
      save: 'حفظ',
      cancel: 'إلغاء',
      remove: 'حذف',
      edit: 'تعديل',
      removeAll: 'حذف الكل',
      proceedToPayment: 'المتابعة للدفع',
      addToCart: 'أضف إلى السلة',
      noData: 'لا توجد بيانات بعد.',
      previous: 'السابق',
      next: 'التالي',
      customer: 'العميل',
      address: 'العنوان',
      date: 'التاريخ',
      sold: 'مباع',
      productsSupplied: 'منتج مورّد'
    },
    home: {
      heroLabel: 'مون ستور',
      heroTitleLine1: 'ارفع مستوى',
      heroTitleAccent: 'الأزياء العصرية',
      heroSubtitle: 'اكتشف ملابس مميزة وعصرية مختارة بعناية للعصر الحديث، مع مجموعات ثلاثية الأبعاد مصممة لتترك أثراً.',
      heroButton: 'استكشف المجموعة',
      winterLabel: 'اختيارات الطقس البارد',
      winterTitle: 'مجموعة الشتاء',
      summerLabel: 'اختيارات الصيف',
      summerTitle: 'مجموعة الصيف',
      footerOwner: 'تصميم وتطوير MohamedHamed',
      footerCopy: 'جميع الحقوق محفوظة لـ M.Hamed'
    },
    login: {
      title: 'تسجيل الدخول',
      username: 'اسم المستخدم',
      password: 'كلمة المرور',
      forgotPassword: 'هل نسيت كلمة المرور؟',
      registerPrompt: 'ليس لديك حساب؟ أنشئ حساباً',
      submit: 'دخول',
      invalidCredentials: 'بيانات الدخول غير صحيحة',
      success: 'تم تسجيل الدخول بنجاح',
      hidePassword: 'إخفاء كلمة المرور',
      showPassword: 'إظهار كلمة المرور'
    },
    register: {
      title: 'إنشاء حساب',
      username: 'اسم المستخدم',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف (اختياري)',
      password: 'كلمة المرور',
      submit: 'تسجيل',
      loginPrompt: 'لديك حساب بالفعل؟ سجّل الدخول',
      success: 'تم التسجيل بنجاح، جارٍ التحويل...',
      failed: 'فشل التسجيل، ربما اسم المستخدم مستخدم بالفعل.',
      hidePassword: 'إخفاء كلمة المرور',
      showPassword: 'إظهار كلمة المرور'
    },
    forgot: {
      title: 'نسيت كلمة المرور',
      email: 'البريد الإلكتروني',
      submit: 'إرسال رابط إعادة التعيين',
      backToLogin: 'العودة لتسجيل الدخول',
      processingError: 'حدث خطأ أثناء معالجة الطلب',
      mockSent: 'تم إرسال بريد تجريبي!'
    },
    reset: {
      title: 'إعادة تعيين كلمة المرور',
      newPassword: 'كلمة المرور الجديدة',
      submit: 'إعادة التعيين',
      failed: 'فشل إعادة التعيين'
    },
    favourites: {
      title: 'مفضلتك',
      empty: 'لم تقم بإضافة أي عناصر إلى المفضلة بعد.',
      remove: 'حذف',
      addToCart: 'أضف إلى السلة',
      added: 'تمت الإضافة إلى السلة!',
      loginFirst: 'يرجى تسجيل الدخول أولاً لإضافة المنتج إلى السلة.'
    },
    cart: {
      title: 'سلتك',
      empty: 'سلتك فارغة.',
      total: 'الإجمالي',
      proceed: 'المتابعة للدفع',
      errors: {
        outOfStock: 'هذا المنتج غير متاح حاليًا.',
        noMoreStock: 'لا توجد كمية إضافية متاحة من هذا المنتج.',
        stockExceeded: 'الكمية المطلوبة أكبر من المخزون المتاح.'
      }
    },
    product: {
      addToCart: 'أضف إلى السلة',
      addedToCart: 'تمت الإضافة إلى السلة!',
      loginCart: 'يرجى تسجيل الدخول أولاً لإضافة المنتج إلى السلة.',
      updatedFavourites: 'تم تحديث المفضلة!',
      loginFav: 'يرجى تسجيل الدخول أولاً لتحديث المفضلة.',
      loginRequired: 'يرجى تسجيل الدخول أولاً.',
      outOfStock: 'نفدت الكمية',
      inStock: 'متوفر',
      inStockCount: 'متوفر {{count}} قطعة'
    },
    shipping: {
      eyebrow: 'توصيل مجري',
      title: 'من المخزن القمري إلى باب منزلك مع حفظ كل تفاصيل الشحن بدقة.',
      subtitle: 'املأ كل بيانات الشحن حتى يتم تجهيز الطلب بدون تأخير أو الحاجة للتواصل معك مرة أخرى.',
      heading: 'بيانات الشحن',
      fullName: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      city: 'المدينة',
      area: 'المنطقة',
      street: 'العنوان',
      apartment: 'المبنى / الشقة',
      postal: 'الرمز البريدي',
      orderTotal: 'إجمالي الطلب',
      confirm: 'تأكيد التوصيل',
      successTitle: 'تم تأكيد الطلب',
      successText: 'تم حفظ بيانات الشحن وأصبح طلبك ضمن قائمة لوحة التحكم.',
      returnToStore: 'العودة للمتجر',
      errors: {
        fullName: 'يرجى إدخال الاسم الكامل.',
        email: 'يرجى إدخال بريد إلكتروني صحيح.',
        phone: 'يرجى إدخال رقم هاتف صحيح.',
        city: 'المدينة مطلوبة.',
        area: 'المنطقة مطلوبة.',
        street: 'العنوان مطلوب.',
        apartment: 'المبنى أو الشقة مطلوب.',
        postal: 'يرجى إدخال رمز بريدي صحيح.',
        complete: 'يرجى استكمال جميع بيانات الشحن.',
        emptyCart: 'سلتك فارغة.',
        createFailed: 'تعذر إنشاء الطلب.'
      }
    },
    myOrders: {
      eyebrow: 'تتبع مباشر',
      title: 'طلباتي',
      subtitle: 'تابع كل مرحلة من مراحل الشحن وشاهد المنتجات الموجودة داخل كل طلب.',
      empty: 'لا توجد طلبات بعد. بعد إتمام الشراء ستظهر طلباتك هنا.',
      qtyPrice: 'الكمية {{quantity}} • ${{price}}',
      cancel: 'إلغاء الطلب',
      requestReturn: 'طلب إرجاع',
      actions: {
        cancelSuccess: 'تم إلغاء الطلب بنجاح.',
        returnRequested: 'تم إرسال طلب الإرجاع بنجاح.',
        cancelFailed: 'تعذر إلغاء هذا الطلب.',
        returnFailed: 'تعذر إرسال طلب الإرجاع.'
      }
    },
    admin: {
      title: 'إدارة مون ستور',
      products: 'المنتجات',
      orders: 'الطلبات',
      customers: 'العملاء',
      purchaseOrders: 'أوامر الشراء',
      insights: 'التحليلات',
      shopHome: 'المتجر',
      addProduct: 'إضافة منتج',
      productManagement: 'إدارة المنتجات',
      editProduct: 'تعديل المنتج',
      addNewProduct: 'إضافة منتج',
      fields: {
        name: 'الاسم',
        description: 'الوصف',
        price: 'سعر البيع',
        costPrice: 'سعر التكلفة',
        supplier: 'المورّد',
        stockQuantity: 'الكمية بالمخزن',
        category: 'الفئة',
        image: 'صورة المنتج'
      },
      fieldHelp: {
        name: 'اسم المنتج الذي يظهر للعميل في البطاقات وصفحة التفاصيل.',
        description: 'وصف مختصر يوضح شكل المنتج أو خامته أو استخدامه.',
        price: 'سعر البيع الذي يظهر للعملاء داخل المتجر.',
        costPrice: 'تكلفة شراء أو تصنيع القطعة الواحدة بالنسبة لك.',
        supplier: 'اسم المورد أو الشركة التي توفر هذا المنتج.',
        stockQuantity: 'عدد القطع المتاحة حاليًا في المخزون.',
        category: 'حدد المجموعة التي يظهر فيها المنتج في الصفحة الرئيسية.',
        image: 'ارفع الصورة الرئيسية التي ستظهر للمنتج داخل المتجر.'
      },
      winter: 'مجموعة الشتاء',
      summer: 'مجموعة الصيف',
      currentImage: 'الصورة الحالية محفوظة',
      totalProducts: 'إجمالي المنتجات',
      totalOrders: 'إجمالي الطلبات',
      revenue: 'الإيراد',
      lowStock: 'مخزون منخفض',
      realtimeOrders: 'متابعة الطلبات',
      trackOrders: 'تابع كل طلب من وقت الشراء حتى التسليم.',
      noOrders: 'لا توجد طلبات حتى الآن.',
      customerManagement: 'إدارة العملاء',
      customerManagementCopy: 'تابع نشاط العملاء وسجل الطلبات والعملاء الأعلى إنفاقًا.',
      noCustomers: 'لا يوجد عملاء حتى الآن.',
      customersCount: 'العملاء',
      totalSpent: 'إجمالي الإنفاق',
      latestOrder: 'آخر طلب',
      noPhone: 'بدون هاتف',
      noEmail: 'بدون بريد',
      restockPlanning: 'تخطيط إعادة التوريد',
      restockPlanningCopy: 'اقتراحات مباشرة حسب المورد للمنتجات منخفضة المخزون وأوامر الشراء القادمة.',
      noRestockNeeded: 'المخزون جيد حاليًا. لا توجد اقتراحات إعادة توريد الآن.',
      reorderQty: 'كمية إعادة الطلب',
      soldLast30Days: 'مباع خلال 30 يومًا',
      estimatedCost: 'التكلفة التقديرية',
      priority: 'الأولوية',
      supplierTotal: 'إجمالي المورد',
      priorityCritical: 'حرجة',
      priorityHigh: 'مرتفعة',
      priorityNormal: 'عادية',
      markShipped: 'تحديد كتم شحن',
      markDelivered: 'تحديد كتم تسليم',
      markCancelled: 'إلغاء الطلب',
      approveRefund: 'اعتماد الاسترجاع',
      rejectReturn: 'رفض الإرجاع',
      storeInsights: 'تحليلات المتجر',
      storeInsightsCopy: 'نظرة تشغيلية مباشرة على الإيرادات، حركة الطلبات، وأداء المنتجات.',
      noInsights: 'أضف بعض الطلبات وسيبدأ هذا القسم بإظهار الاتجاهات وحالات الطلبات والمنتجات الأكثر مبيعاً.',
      kpis: {
        totalRevenue: 'إجمالي الإيراد',
        grossProfit: 'إجمالي الربح التقديري',
        averageOrder: 'متوسط قيمة الطلب',
        deliveredOrders: 'الطلبات المسلمة',
        outOfStock: 'منتجات نفدت',
        margin: 'هامش الربح التقديري'
      },
      inventoryAlerts: 'تنبيهات المخزون',
      inventoryAlertsCopy: 'منتجات تحتاج لإعادة توريد قريباً',
      inventoryHealthy: 'مستويات المخزون جيدة حالياً.',
      revenueTrend: 'اتجاه الإيرادات',
      revenueTrendCopy: 'إيرادات آخر 7 أيام',
      statusMix: 'توزيع حالات الطلبات',
      statusMixCopy: 'موقع كل الطلبات الحالية الآن',
      topProducts: 'أفضل المنتجات',
      topProductsCopy: 'الأكثر مبيعاً حسب الكمية',
      categoryPerformance: 'أداء الفئات',
      categoryPerformanceCopy: 'الإيراد والحركة بين مجموعات المتجر',
      supplierOverview: 'نظرة على المورّدين',
      supplierOverviewCopy: 'تأثير كل مورّد حسب قيمة المخزون الحالية',
      orderCount: 'طلبات',
      unsorted: 'غير مصنف',
      noSupplier: 'بدون مورّد',
      unassignedSupplier: 'مورّد غير محدد',
      stockStatus: {
        out: 'نفد',
        low: 'منخفض',
        outOfStock: 'نفد المخزون',
        inStock: 'متوفر {{count}} قطعة'
      },
      actions: {
        updateSuccess: 'تم تحديث المنتج بنجاح.',
        createSuccess: 'تمت إضافة المنتج بنجاح.',
        deleteSuccess: 'تم حذف المنتج بنجاح.',
        uploadFailed: 'فشل رفع الصورة.',
        updateFailed: 'تعذر تحديث المنتج.',
        createFailed: 'تعذر إنشاء المنتج.',
        deleteFailed: 'تعذر حذف المنتج.',
        confirmDelete: 'هل أنت متأكد؟'
      }
    },
    status: {
      Pending: 'قيد الانتظار',
      Shipped: 'تم الشحن',
      Delivered: 'تم التسليم',
      Cancelled: 'ملغي',
      ReturnRequested: 'تم طلب إرجاع',
      Refunded: 'تم الاسترجاع'
    },
    toast: {
      logout: 'تم تسجيل الخروج بنجاح',
      welcome: 'مرحباً، {{name}}!'
    }
  }
};

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly storageKey = 'moon-store-language';
  private readonly languageSubject = new BehaviorSubject<AppLanguage>('en');
  readonly language$ = this.languageSubject.asObservable();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    const initialLanguage = this.readStoredLanguage();
    this.languageSubject.next(initialLanguage);
    this.applyDocumentLanguage(initialLanguage);
  }

  get currentLanguage(): AppLanguage {
    return this.languageSubject.value;
  }

  get isArabic(): boolean {
    return this.currentLanguage === 'ar';
  }

  setLanguage(language: AppLanguage) {
    this.languageSubject.next(language);
    this.persistLanguage(language);
    this.applyDocumentLanguage(language);
  }

  toggleLanguage() {
    this.setLanguage(this.isArabic ? 'en' : 'ar');
  }

  t(key: string, params?: Record<string, string | number>): string {
    const raw = this.lookup(this.currentLanguage, key) ?? this.lookup('en', key) ?? key;
    if (!params) {
      return raw;
    }

    return Object.entries(params).reduce(
      (message, [token, value]) => message.replaceAll(`{{${token}}}`, String(value)),
      raw
    );
  }

  private lookup(language: AppLanguage, key: string): string | null {
    const parts = key.split('.');
    let current: string | TranslationTree = translations[language];

    for (const part of parts) {
      if (typeof current === 'string') {
        return null;
      }

      current = current[part];
      if (current === undefined) {
        return null;
      }
    }

    return typeof current === 'string' ? current : null;
  }

  private applyDocumentLanguage(language: AppLanguage) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const dir = language === 'ar' ? 'rtl' : 'ltr';
    this.document.documentElement.lang = language;
    this.document.documentElement.dir = dir;
    this.document.body.classList.toggle('rtl', dir === 'rtl');
    this.document.body.classList.toggle('ltr', dir === 'ltr');
  }

  private readStoredLanguage(): AppLanguage {
    if (!isPlatformBrowser(this.platformId)) {
      return 'en';
    }

    const stored = localStorage.getItem(this.storageKey);
    return stored === 'ar' ? 'ar' : 'en';
  }

  private persistLanguage(language: AppLanguage) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(this.storageKey, language);
  }
}
