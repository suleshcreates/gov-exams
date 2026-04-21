// @ts-nocheck
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        const { amount, planId, receipt } = await req.json();

        if (!amount) return new Response(JSON.stringify({ error: "Missing amount" }), { headers: corsHeaders, status: 400 });

        const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
        const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

        if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
            return new Response(JSON.stringify({ error: "Razorpay keys not configured" }), { headers: corsHeaders, status: 500 });
        }

        const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);

        const resp = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Basic ${auth}` },
            body: JSON.stringify({
                amount: Math.round(Number(amount) * 100),
                currency: "INR",
                receipt: receipt || `receipt_${planId}_${Date.now()}`,
                notes: { planId: planId || "" }
            })
        });

        const data = await resp.json();
        if (!resp.ok) {
            console.error("razorpay error:", data);
            return new Response(JSON.stringify({ error: data.error?.description || "Razorpay failed" }), { headers: corsHeaders, status: 400 });
        }

        return new Response(JSON.stringify(data), { headers: corsHeaders, status: 200 });
    } catch (err) {
        console.error("create-razorpay-order error:", err);
        return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), { headers: corsHeaders, status: 400 });
    }
});
