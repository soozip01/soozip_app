import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// .env 수동 로드
const envPath = '/home/ubuntu/soozip_app_v2/.env';
try {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
  });
} catch(e) {}

const url = process.env.SURVEY_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SURVEY_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('URL:', url ? url.substring(0, 40) : 'NOT FOUND');
console.log('Key exists:', !!key);

const supabase = createClient(url, key);

const surveyId = '70';

// 1) 패키지 조회
const { data: packages, error: pkgError } = await supabase
  .from('styling_packages')
  .select('*')
  .eq('survey_id', surveyId)
  .order('created_at', { ascending: false });

console.log('pkgError:', pkgError);
console.log('packages count:', packages?.length);

if (pkgError || !packages || packages.length === 0) {
  console.log('=> 패키지 없음 - 빈 배열 반환');
  process.exit(0);
}

// 2) 아이템 조회
const packageIds = packages.map(p => p.id);
console.log('packageIds:', packageIds);

const { data: items, error: itemsError } = await supabase
  .from('styling_package_items')
  .select('*')
  .in('package_id', packageIds)
  .order('sort_order', { ascending: true });

console.log('itemsError:', itemsError);
console.log('items count:', items?.length);

// 3) 라우터와 동일한 방식으로 결과 조합
const result = packages.map(pkg => ({
  ...pkg,
  items: (items || []).filter(item => item.package_id === pkg.id),
}));

console.log('Final result:', JSON.stringify(result, null, 2).substring(0, 1000));
