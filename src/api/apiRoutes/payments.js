'use strict'

const express = require('express')
const supabase = require('../supabase')
const logger = require('../../utils/logger')

const paymentRouter = express.Router()

// M-Pesa Webhook Endpoint
paymentRouter.post('/mpesa/callback', async (req, res) => {
  // M-Pesa sends the response in Body.stkCallback
  const callbackData = req.body.Body?.stkCallback
  
  if (!callbackData) {
    return res.status(400).json({ error: 'Invalid M-Pesa payload' })
  }

  const { CheckoutRequestID, ResultCode, CallbackMetadata } = callbackData

  try {
    // 1. Check if payment is already processed (Idempotency)
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('checkout_request_id', CheckoutRequestID)
      .single()

    if (!existingPayment || existingPayment.status === 'completed') {
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    // 2. Process based on ResultCode (0 = Success)
    if (ResultCode === 0) {
      // Extract M-Pesa receipt from metadata
      const receipt = CallbackMetadata.Item.find(i => i.Name === 'MpesaReceiptNumber')?.Value
      
      // 3. Update payment status
      await supabase.from('payments').update({
        status: 'completed',
        mpesa_receipt: receipt,
        completed_at: new Date().toISOString()
      }).eq('id', existingPayment.id)

      // 4. Credit Tokens using the Postgres function via Supabase RPC
      const { data: newBalance, error } = await supabase.rpc('record_token_change', {
        p_user_id: existingPayment.user_id,
        p_amount: existingPayment.tokens_to_credit,
        p_kind: 'topup',
        p_ref_id: receipt,
        p_metadata: { payment_id: existingPayment.id }
      })

      if (error) throw error
      logger.info(`💰 M-Pesa Payment Success. Credited ${existingPayment.tokens_to_credit} tokens to ${existingPayment.user_id}. New Balance: ${newBalance}`)
    } else {
      // Payment failed or canceled
      await supabase.from('payments').update({ status: 'failed' }).eq('id', existingPayment.id)
      logger.warn(`❌ M-Pesa Payment Failed: ${ResultCode}`)
    }

    res.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  } catch (error) {
    logger.error('M-Pesa Webhook Error: ' + error.message)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

module.exports = paymentRouter
