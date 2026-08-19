import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Razorpay from "npm:razorpay@2.9.2";
import crypto from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;
    
    const razorpay = new Razorpay({
      key_id: Deno.env.get("RAZORPAY_KEY_ID") || "",
      key_secret: Deno.env.get("RAZORPAY_KEY_SECRET") || "",
    });

    // 1. Create Order Route
    if (pathname.endsWith("/create-order") && req.method === 'POST') {
      const { amount, currency = "INR", receipt } = await req.json();

      if (!amount) {
        return new Response(JSON.stringify({ error: "Amount is required" }), { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // convert to paise
        currency,
        receipt,
      });

      return new Response(JSON.stringify(order), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2. Verify Payment Route
    if (pathname.endsWith("/verify-payment") && req.method === 'POST') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
      const secret = Deno.env.get("RAZORPAY_KEY_SECRET") || "";

      const generated_signature = crypto
        .createHmac("sha256", secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

      if (generated_signature === razorpay_signature) {
        return new Response(JSON.stringify({ success: true, message: "Payment verified successfully" }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ success: false, message: "Invalid signature" }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });

  } catch (error) {
    console.error("Razorpay function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
