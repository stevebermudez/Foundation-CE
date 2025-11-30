/**
 * Bitcoin Payment Service
 * 
 * Supports Bitcoin payments through configurable providers:
 * - BTCPay Server (self-hosted)
 * - Coinbase Commerce (cloud)
 * - Or custom Bitcoin implementation
 * 
 * Usage:
 * 1. Set BITCOIN_PAYMENT_PROVIDER env var (btcpay, coinbase, or custom)
 * 2. Set provider-specific credentials
 * 3. Call createBitcoinPayment() to generate payment request
 */

export interface BitcoinPaymentRequest {
  enrollmentId: string;
  userId: string;
  courseId: string;
  priceInUSD: number;
  description: string;
  returnUrl: string;
}

export interface BitcoinPaymentResponse {
  paymentId: string;
  bitcoinAddress: string;
  amountBTC: string;
  amountUSD: number;
  expiryTime: number; // Unix timestamp
  qrCodeUrl?: string;
  paymentUrl?: string;
  status: 'pending' | 'confirmed' | 'expired';
}

export class BitcoinService {
  private provider: string;

  constructor() {
    this.provider = process.env.BITCOIN_PAYMENT_PROVIDER || 'btcpay';
  }

  /**
   * Create a Bitcoin payment request
   * Supports multiple providers through environment configuration
   */
  async createBitcoinPayment(request: BitcoinPaymentRequest): Promise<BitcoinPaymentResponse> {
    switch (this.provider) {
      case 'btcpay':
        return this.createBTCPayInvoice(request);
      case 'coinbase':
        return this.createCoinbaseCharge(request);
      default:
        throw new Error(`Unsupported Bitcoin provider: ${this.provider}`);
    }
  }

  /**
   * BTCPay Server integration
   * Requires: BTCPAY_SERVER_URL, BTCPAY_API_KEY, BTCPAY_STORE_ID
   */
  private async createBTCPayInvoice(request: BitcoinPaymentRequest): Promise<BitcoinPaymentResponse> {
    const btcpayUrl = process.env.BTCPAY_SERVER_URL;
    const apiKey = process.env.BTCPAY_API_KEY;
    const storeId = process.env.BTCPAY_STORE_ID;

    if (!btcpayUrl || !apiKey || !storeId) {
      throw new Error('BTCPay Server credentials not configured');
    }

    // Fetch current BTC price
    const btcPrice = await this.fetchBTCPrice();
    const amountBTC = (request.priceInUSD / btcPrice).toFixed(8);

    // Create invoice via BTCPay API
    const invoiceResponse = await fetch(`${btcpayUrl}/api/v1/stores/${storeId}/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: request.priceInUSD,
        currency: 'USD',
        orderId: request.enrollmentId,
        itemDescription: request.description,
        notificationUrl: `${process.env.REPLIT_DOMAINS ? 'https://' + process.env.REPLIT_DOMAINS.split(',')[0] : ''}/api/bitcoin/webhook`,
        redirectUrl: request.returnUrl,
        metadata: {
          enrollmentId: request.enrollmentId,
          userId: request.userId,
          courseId: request.courseId,
        },
      }),
    });

    if (!invoiceResponse.ok) {
      throw new Error(`BTCPay API error: ${invoiceResponse.statusText}`);
    }

    const invoice = await invoiceResponse.json();

    return {
      paymentId: invoice.id,
      bitcoinAddress: invoice.bitcoinAddress,
      amountBTC: amountBTC,
      amountUSD: request.priceInUSD,
      expiryTime: new Date(invoice.expirationTime).getTime() / 1000,
      qrCodeUrl: `${btcpayUrl}/i/${invoice.id}.png`,
      paymentUrl: `${btcpayUrl}/i/${invoice.id}`,
      status: 'pending',
    };
  }

  /**
   * Coinbase Commerce integration
   * Requires: COINBASE_API_KEY
   */
  private async createCoinbaseCharge(request: BitcoinPaymentRequest): Promise<BitcoinPaymentResponse> {
    const apiKey = process.env.COINBASE_API_KEY;

    if (!apiKey) {
      throw new Error('Coinbase API key not configured');
    }

    const chargeResponse = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'X-CC-Api-Key': apiKey,
        'X-CC-Version': '2018-03-22',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: request.description,
        description: `Course: ${request.courseId}`,
        local_price: {
          amount: request.priceInUSD,
          currency: 'USD',
        },
        pricing_type: 'fixed_price',
        metadata: {
          enrollmentId: request.enrollmentId,
          userId: request.userId,
          courseId: request.courseId,
        },
      }),
    });

    if (!chargeResponse.ok) {
      throw new Error(`Coinbase API error: ${chargeResponse.statusText}`);
    }

    const charge = await chargeResponse.json();
    const btcData = charge.data.pricing.bitcoin;

    return {
      paymentId: charge.data.id,
      bitcoinAddress: btcData.address,
      amountBTC: btcData.amount,
      amountUSD: request.priceInUSD,
      expiryTime: Math.floor(new Date(charge.data.expires_at).getTime() / 1000),
      paymentUrl: charge.data.hosted_url,
      status: 'pending',
    };
  }

  /**
   * Fetch current BTC price in USD
   */
  private async fetchBTCPrice(): Promise<number> {
    try {
      const response = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
      const data = await response.json();
      return parseFloat(data.data.amount);
    } catch (error) {
      console.error('Error fetching BTC price:', error);
      // Fallback to cached price or default
      return 45000; // Placeholder price
    }
  }

  /**
   * Verify Bitcoin payment status
   */
  async verifyPayment(paymentId: string): Promise<{
    status: 'pending' | 'confirmed' | 'expired' | 'failed';
    confirmations?: number;
    transactionHash?: string;
  }> {
    switch (this.provider) {
      case 'btcpay':
        return this.verifyBTCPayInvoice(paymentId);
      case 'coinbase':
        return this.verifyCoinbaseCharge(paymentId);
      default:
        throw new Error(`Unsupported Bitcoin provider: ${this.provider}`);
    }
  }

  private async verifyBTCPayInvoice(invoiceId: string): Promise<any> {
    const btcpayUrl = process.env.BTCPAY_SERVER_URL;
    const apiKey = process.env.BTCPAY_API_KEY;
    const storeId = process.env.BTCPAY_STORE_ID;

    if (!btcpayUrl || !apiKey || !storeId) {
      throw new Error('BTCPay Server credentials not configured');
    }

    const response = await fetch(`${btcpayUrl}/api/v1/stores/${storeId}/invoices/${invoiceId}`, {
      headers: {
        'Authorization': `token ${apiKey}`,
      },
    });

    const invoice = await response.json();

    return {
      status: invoice.status === 'settled' ? 'confirmed' : invoice.status === 'expired' ? 'expired' : 'pending',
      confirmations: invoice.payments?.length ? 1 : 0,
      transactionHash: invoice.payments?.[0]?.id,
    };
  }

  private async verifyCoinbaseCharge(chargeId: string): Promise<any> {
    const apiKey = process.env.COINBASE_API_KEY;

    if (!apiKey) {
      throw new Error('Coinbase API key not configured');
    }

    const response = await fetch(`https://api.commerce.coinbase.com/charges/${chargeId}`, {
      headers: {
        'X-CC-Api-Key': apiKey,
        'X-CC-Version': '2018-03-22',
      },
    });

    const charge = await response.json();
    const status = charge.data.timeline?.[0]?.status;

    return {
      status: status === 'confirmed' ? 'confirmed' : status === 'expired' ? 'expired' : 'pending',
      confirmations: charge.data.confirmations || 0,
      transactionHash: charge.data.bitcoin_transaction_id,
    };
  }
}

export const bitcoinService = new BitcoinService();
