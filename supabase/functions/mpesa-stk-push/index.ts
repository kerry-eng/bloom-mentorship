import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone, amount, sessionId } = await req.json();

    if (!phone || !amount || !sessionId) {
      throw new Error("Missing required parameters: phone, amount, sessionId");
    }

    // 1. Get Daraja Credentials from Edge Function Secrets
    const consumerKey = Deno.env.get("DARAJA_CONSUMER_KEY") || "YOUR_CONSUMER_KEY";
    const consumerSecret = Deno.env.get("DARAJA_CONSUMER_SECRET") || "YOUR_CONSUMER_SECRET";
    const passKey = Deno.env.get("DARAJA_PASSKEY") || "YOUR_PASSKEY";
    const shortCode = Deno.env.get("DARAJA_SHORTCODE") || "174379"; // default test paybill

    // 2. Generate Auth Token
    const authBuffer = new TextEncoder().encode(`${consumerKey}:${consumerSecret}`);
    const authBase64 = btoa(String.fromCharCode(...authBuffer));
    
    // Note: For production use https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials
    const tokenRes = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: { Authorization: `Basic ${authBase64}` },
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error("Failed to generate Daraja token");

    // 3. Initiate STK Push
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const password = btoa(`${shortCode}${passKey}${timestamp}`);
    const callbackUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/mpesa-callback`;

    const stkBody = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.ceil(amount),
      PartyA: phone, // e.g., 2547XXXXXXXX
      PartyB: shortCode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: `Mentorship_${sessionId.slice(0,8)}`,
      TransactionDesc: "Payment for mentorship session",
    };

    // Note: For production use https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest
    const stkRes = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkBody),
    });
    const stkData = await stkRes.json();

    if (stkData.ResponseCode !== "0") {
      throw new Error(`Daraja API Error: ${stkData.errorMessage || stkData.ResponseDescription}`);
    }

    // 4. Update the Supabase Session with the CheckoutRequestID to track the payment
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: dbError } = await supabaseClient
      .from("sessions")
      .update({ stripe_payment_id: stkData.CheckoutRequestID, status: "pending" })
      .eq("id", sessionId);

    if (dbError) throw dbError;

    return new Response(JSON.stringify({ success: true, data: stkData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
