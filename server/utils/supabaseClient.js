const { createClient } = require("@supabase/supabase-js");

console.log("🔐 Supabase URL:", process.env.SUPABASE_URL);
console.log("🔐 Supabase Key:", process.env.SUPABASE_SERVICE_ROLE);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

module.exports = supabase;
