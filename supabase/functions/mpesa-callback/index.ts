import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

serve(async (req) => {
  try {
    const data = await req.json();
    const result = data?.Body?.stkCallback;

    if (!result) throw new Error("Invalid callback payload");

    const checkoutRequestId = result.CheckoutRequestID;
    const resultCode = result.ResultCode;

    if (!checkoutRequestId) throw new Error("Missing CheckoutRequestID");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // If ResultCode is 0, payment was successful
    if (resultCode === 0) {
      await supabaseClient
        .from("sessions")
        .update({ status: "paid" })
        .eq("stripe_payment_id", checkoutRequestId);
    } else {
      // Payment failed or cancelled
      await supabaseClient
        .from("sessions")
        .update({ status: "cancelled" }) // or leave pending and let it expire
        .eq("stripe_payment_id", checkoutRequestId);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
