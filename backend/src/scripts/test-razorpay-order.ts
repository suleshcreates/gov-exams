import Razorpay from 'razorpay';
import env from '../config/env';

const razorpay = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
});

async function testOrder() {
    console.log('Testing Razorpay Order Creation...');
    console.log(`Key ID: ${env.RAZORPAY_KEY_ID}`);
    // Don't log secret

    try {
        const amount = 99; // 99 INR
        const receipt = `test_receipt_${Date.now()}`.substring(0, 40);

        const options = {
            amount: amount * 100, // paise
            currency: 'INR',
            receipt: receipt,
            notes: {
                planId: 'test-subject-id',
                type: 'subject'
            }
        };

        console.log('Options:', options);

        const order = await razorpay.orders.create(options);
        console.log('✅ Order Created Successfully:', order);
    } catch (error: any) {
        console.error('❌ Order Creation Failed:', error);
        if (error.error) {
            console.error('Razorpay Error Details:', error.error);
        }
    }
}

testOrder();
