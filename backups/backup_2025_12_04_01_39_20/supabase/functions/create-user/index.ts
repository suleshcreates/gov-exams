// @ts-nocheck

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // DEBUG: Check environment variables
        const serviceRoleKey = Deno.env.get("MY_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        const supabaseUrl = Deno.env.get("SUPABASE_URL");

        if (!serviceRoleKey) {
            return new Response(JSON.stringify({ success: false, error: "Missing Service Role Key (MY_SERVICE_ROLE_KEY or SUPABASE_SERVICE_ROLE_KEY)" }), {
                headers: corsHeaders,
                status: 200, // Return 200 to see error in client
            });
        }

        if (!supabaseUrl) {
            return new Response(JSON.stringify({ success: false, error: "Missing SUPABASE_URL" }), {
                headers: corsHeaders,
                status: 200,
            });
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey);

        const body = await req.json();
        const { email, password, user_metadata } = body;

        if (!email || !password) {
            return new Response(JSON.stringify({ success: false, error: "Missing email or password in request body" }), {
                headers: corsHeaders,
                status: 200,
            });
        }

        console.log("Creating user:", email);

        // Try to create the user
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata,
        });

        if (error) {
            // If user already exists, find them and return them
            if (error.message.includes("already registered") || error.status === 422) {
                console.log("User exists, fetching details...");
                const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
                
                if (listError) {
                    return new Response(JSON.stringify({ success: false, error: "Failed to list users: " + listError.message }), {
                        headers: corsHeaders,
                        status: 200,
                    });
                }
                
                const existingUser = listData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
                
                if (existingUser) {
                    return new Response(JSON.stringify({ success: true, user: existingUser, action: "found_existing" }), {
                        headers: corsHeaders,
                        status: 200,
                    });
                } else {
                     return new Response(JSON.stringify({ success: false, error: "User reported as existing but not found in list" }), {
                        headers: corsHeaders,
                        status: 200,
                    });
                }
            }

            console.error("Create user error:", error);
            return new Response(JSON.stringify({ success: false, error: error.message }), {
                headers: corsHeaders,
                status: 200,
            });
        }

        return new Response(JSON.stringify({ success: true, user: data.user, action: "created" }), {
            headers: corsHeaders,
            status: 200,
        });
    } catch (err) {
        console.error("Edge Function Error:", err);
        return new Response(
            JSON.stringify({ success: false, error: err?.message || "Unknown error in try/catch" }),
            { headers: corsHeaders, status: 200 }, // Return 200 to see error
        );
    }
});
