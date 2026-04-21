// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const body = await req.json();
        const { email, password, user_metadata } = body;

        if (!email || !password) return new Response(JSON.stringify({ error: "Missing email/password" }), { headers: corsHeaders, status: 400 });

        // Try create user
        const { data: createData, error: createErr } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata
        });

        if (!createErr && createData?.user?.id) {
            // link students row
            const { error: linkErr } = await supabase.from("students").update({ auth_user_id: createData.user.id }).eq("email", email);
            if (linkErr) console.error("sync-user-auth link error:", linkErr);
            return new Response(JSON.stringify({ user: createData.user, action: "created" }), { headers: corsHeaders, status: 200 });
        }

        // If create failed because user exists, find and update
        // Use admin.listUsers
        const { data: listData, error: listErr } = await supabase.auth.admin.listUsers();
        if (listErr) throw listErr;

        const existing = (listData?.users || []).find(u => u.email?.toLowerCase() === email.toLowerCase());

        if (!existing) throw createErr || new Error("User not found in admin list");

        // update password and metadata
        const { data: updated, error: updateErr } = await supabase.auth.admin.updateUserById(existing.id, {
            password,
            user_metadata
        });
        if (updateErr) throw updateErr;

        // link students row
        const { error: linkErr2 } = await supabase.from("students").update({ auth_user_id: existing.id }).eq("email", email);
        if (linkErr2) console.error("sync-user-auth link error 2:", linkErr2);

        return new Response(JSON.stringify({ user: updated, action: "updated" }), { headers: corsHeaders, status: 200 });

    } catch (err) {
        console.error("sync-user-auth error:", err);
        return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), { headers: corsHeaders, status: 400 });
    }
});
