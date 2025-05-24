import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminSupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    // This client uses the service role key which bypasses RLS
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseServiceKey, // You'll need to add this to your environment
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  // You can add methods similar to those in SupabaseService
  // but these will bypass RLS policies
}
