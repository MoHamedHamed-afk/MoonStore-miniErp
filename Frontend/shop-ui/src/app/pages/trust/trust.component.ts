import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-trust',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="trust-shell">
      <div class="trust-backdrop"></div>

      <div class="container trust-layout">
        <header class="glass trust-hero">
          <p class="eyebrow">{{ translation.isArabic ? 'الثقة والدعم' : 'Trust & Support' }}</p>
          <h1>{{ translation.isArabic ? 'كل ما يحتاج العميل معرفته قبل الطلب' : 'Everything customers need before ordering' }}</h1>
          <p>
            {{ translation.isArabic
              ? 'سياسة بسيطة وواضحة للشحن، الاسترجاع، الخصوصية، والتواصل المباشر مع Moon Store.'
              : 'A simple, clear policy page for shipping, returns, privacy, and direct Moon Store support.' }}
          </p>

          <a class="whatsapp-btn" [href]="whatsappUrl" target="_blank" rel="noopener">
            {{ translation.isArabic ? 'تواصل واتساب: 01125223260' : 'WhatsApp: 01125223260' }}
          </a>
        </header>

        <div class="trust-grid">
          <article class="glass trust-card" *ngFor="let card of cards">
            <span class="card-icon">{{ card.icon }}</span>
            <h2>{{ translation.isArabic ? card.titleAr : card.title }}</h2>
            <p>{{ translation.isArabic ? card.bodyAr : card.body }}</p>
          </article>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .trust-shell { position: relative; min-height: 100vh; padding: 120px 0 56px; overflow: hidden; }
    .trust-backdrop {
      position: absolute;
      inset: 0;
      z-index: -1;
      background:
        radial-gradient(circle at 18% 14%, rgba(155, 142, 199, .28), transparent 30%),
        radial-gradient(circle at 82% 18%, rgba(180, 211, 217, .18), transparent 28%),
        linear-gradient(180deg, #060811 0%, #101426 54%, #080b14 100%);
    }
    :host-context(body:not(.dark)) .trust-backdrop {
      background:
        radial-gradient(circle at 18% 14%, rgba(189, 166, 206, .36), transparent 30%),
        radial-gradient(circle at 82% 18%, rgba(180, 211, 217, .42), transparent 28%),
        linear-gradient(180deg, #fbf8ff 0%, #eef5f8 54%, #f4ede5 100%);
    }
    .trust-layout { display: grid; gap: 24px; }
    .trust-hero {
      padding: clamp(28px, 5vw, 56px);
      border-radius: 32px;
      display: grid;
      gap: 16px;
      max-width: 980px;
    }
    .eyebrow {
      margin: 0;
      text-transform: uppercase;
      letter-spacing: .18em;
      color: var(--secondary-accent);
      font-weight: 800;
      font-size: .82rem;
    }
    h1 { margin: 0; font-size: clamp(2.2rem, 5vw, 4.6rem); line-height: 1.02; max-width: 860px; }
    p { margin: 0; line-height: 1.7; opacity: .84; }
    .whatsapp-btn {
      width: fit-content;
      margin-top: 8px;
      border-radius: 999px;
      padding: 13px 20px;
      text-decoration: none;
      color: #07100b;
      font-weight: 900;
      background: linear-gradient(135deg, #57d8a3, #b4d3d9);
      box-shadow: 0 18px 36px rgba(87, 216, 163, .24);
    }
    .trust-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
    }
    .trust-card {
      padding: 24px;
      border-radius: 26px;
      display: grid;
      gap: 12px;
    }
    .card-icon {
      width: 48px;
      height: 48px;
      display: grid;
      place-items: center;
      border-radius: 18px;
      background: rgba(255, 255, 255, .08);
      font-size: 1.4rem;
    }
    .trust-card h2 { margin: 0; font-size: 1.25rem; }
    @media (max-width: 900px) {
      .trust-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 560px) {
      .trust-shell { padding-top: 96px; }
      .trust-grid { grid-template-columns: 1fr; }
      .whatsapp-btn { width: 100%; text-align: center; }
    }
  `]
})
export class TrustComponent {
  whatsappUrl = 'https://wa.me/201125223260';

  cards = [
    {
      icon: '🚚',
      title: 'Shipping',
      body: 'Orders are reviewed manually, then prepared and delivered based on the customer address and phone confirmation.',
      titleAr: 'الشحن',
      bodyAr: 'تتم مراجعة الطلب يدوياً ثم تجهيزه وتوصيله حسب العنوان ورقم الهاتف المسجل.'
    },
    {
      icon: '💵',
      title: 'Payment',
      body: 'Phase 1 uses cash on delivery. No online card payment is collected through the website right now.',
      titleAr: 'الدفع',
      bodyAr: 'المرحلة الأولى تعتمد على الدفع عند الاستلام، ولا يتم تحصيل أي بيانات بطاقة داخل الموقع حالياً.'
    },
    {
      icon: '↩',
      title: 'Returns',
      body: 'Return requests are handled by support after checking order status and product condition.',
      titleAr: 'الاسترجاع',
      bodyAr: 'يتم التعامل مع طلبات الاسترجاع من خلال الدعم بعد مراجعة حالة الطلب وحالة المنتج.'
    },
    {
      icon: '🔒',
      title: 'Privacy',
      body: 'Customer information is used only to process orders, contact the customer, and manage delivery.',
      titleAr: 'الخصوصية',
      bodyAr: 'تستخدم بيانات العميل فقط لتجهيز الطلب والتواصل معه وإدارة عملية التوصيل.'
    }
  ];

  constructor(public translation: TranslationService) {}
}
