import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

const SupabaseTest = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('Testing connection...');

    try {
      // Test 1: Check if Supabase client is initialized
      setResult(prev => prev + '\n✓ Supabase client initialized');

      // Test 2: Try to query admins table with timeout
      setResult(prev => prev + '\n\nQuerying admins table...');
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout after 3 seconds')), 3000);
      });

      const queryPromise = supabase
        .from('admins')
        .select('count')
        .limit(1);

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        setResult(prev => prev + `\n✗ Query error: ${error.message}`);
      } else {
        setResult(prev => prev + `\n✓ Query successful: ${JSON.stringify(data)}`);
      }

      // Test 3: Check auth
      setResult(prev => prev + '\n\nChecking auth session...');
      const { data: { session } } = await supabase.auth.getSession();
      setResult(prev => prev + `\n✓ Auth session: ${session ? 'Active' : 'None'}`);

    } catch (error: any) {
      setResult(prev => prev + `\n✗ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      <button
        onClick={testConnection}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Run Test'}
      </button>

      <pre className="mt-4 p-4 bg-gray-100 rounded-lg whitespace-pre-wrap">
        {result || 'Click "Run Test" to start'}
      </pre>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold mb-2">Environment Variables:</h3>
        <p>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing'}</p>
        <p>VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}</p>
      </div>
    </div>
  );
};

export default SupabaseTest;
