// Payment methods with minimum amounts, card numbers and holder name.
//
// Karta ma'lumotlari (`cardNumber` + `cardHolder`) barcha to'lov usullari uchun
// bir xil — chunki pul aslida bitta bank kartasiga keladi, faqat bayrog'i
// (UZCARD/HUMO/PayMe/Click) foydalanuvchining tanlovi bo'yicha ko'rsatiladi.
//
// Yangilash uchun shu faylda kartani almashtirib, `npm run build && pm2 restart aviator-ui` qiling.
const PAYMENT_CARD_NUMBER = '5614684878106374';
const PAYMENT_CARD_HOLDER = 'Abdiqahhorov Bexruz';

export const paymentMethods = [
    { id: 'uzcard', name: 'UZCARD', label: 'Transfer to UZCARD', logo: '/images/uzcardlogo.png', minAmount: 100000, maxAmount: 5000000, cardLabel: 'Bank card', transferLabel: 'transfer to UZCARD', cardNumber: PAYMENT_CARD_NUMBER, cardHolder: PAYMENT_CARD_HOLDER },
    { id: 'humo', name: 'HUMO', label: 'Transfer to HUMO', logo: '/images/humologo1.png', minAmount: 100000, maxAmount: 5000000, cardLabel: 'Bank card', transferLabel: 'transfer to HUMO', cardNumber: PAYMENT_CARD_NUMBER, cardHolder: PAYMENT_CARD_HOLDER },
    { id: 'payme', name: 'PayMe', label: 'Transfer to PayMe', logo: '/images/payme-logo-v2.png', minAmount: 145000, maxAmount: 6500000, cardLabel: 'Bank card', transferLabel: 'transfer to PAYME', cardNumber: PAYMENT_CARD_NUMBER, cardHolder: PAYMENT_CARD_HOLDER },
    { id: 'click', name: 'CLICK', label: 'Transfer to CLICK', logo: '/images/logo_click-v2.png', minAmount: 100000, maxAmount: 5000000, cardLabel: 'Bank card', transferLabel: 'transfer to CLICK', cardNumber: PAYMENT_CARD_NUMBER, cardHolder: PAYMENT_CARD_HOLDER },
];

export type PaymentMethod = typeof paymentMethods[0];

// PayMe va Click logo larining propor­ti­ya­si UZCARD/HUMO ga nisbatan kichikroq —
// shu sababli ularni vizual jihatdan kattaroq qilib ko'rsatamiz.
export const isLargeLogo = (id: string): boolean => id === 'payme' || id === 'click';

// Quick amount options
export const quickAmounts = [
    { value: 500000, label: '500 000.00 UZS' },
    { value: 650000, label: '650 000.00 UZS' },
    { value: 900000, label: '900 000.00 UZS' },
];

// Withdrawal methods
export const withdrawMethods = [
    { id: 'uzcard', name: 'UZCARD', label: 'Pul chiqarish UZCARD', logo: '/images/uzcardlogo.png', minAmount: 325000, maxAmount: 15000000, cardLabel: 'Bank card', transferLabel: 'Pul chiqarish UZCARD', cardFormat: '8600123412341234' },
    { id: 'humo', name: 'HUMO', label: 'Pul chiqarish HUMO', logo: '/images/humologo1.png', minAmount: 325000, maxAmount: 15000000, cardLabel: 'Bank card', transferLabel: 'Pul chiqarish HUMO', cardFormat: '9860123412341234' },
];

export type WithdrawMethod = typeof withdrawMethods[0];

// Format number with spaces
export const formatAmount = (value: number): string => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// Format time remaining
export const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes} min : ${secs.toString().padStart(2, '0')} sec`;
};

export interface PaymentRequest {
    id: string;
    user_id: string;
    method: string;
    amount: number;
    card_number: string;
    status: 'pending' | 'awaiting_review' | 'awaiting_confirmation' | 'completed' | 'expired' | 'cancelled';
    expires_at: string;
    created_at: string;
}
