// Supabase configuration
const supabaseUrl = 'https://llqpuwxvexrrkeyqdgvi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxscXB1d3h2ZXhycmtleXFkZ3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NTMzODAsImV4cCI6MjA1OTMyOTM4MH0.-Rv4KDjbGpTa_EMYf3zSYFBF1eNGcwPYD2JwO_AIzjU';

// Create Supabase client
const createClient = () => {
    return supabase.createClient(supabaseUrl, supabaseKey);
};

export { createClient }; 