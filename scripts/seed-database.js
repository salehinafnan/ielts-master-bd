const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runSeed() {
  const sql = fs.readFileSync(path.resolve(__dirname, '../seed_mock_tests.sql'), 'utf8');
  const jsonBlocks = [];
  const regex = /\$_JSON_\$([\s\S]*?)\$_JSON_\$/g;
  let match, idx = 0;
  while ((match = regex.exec(sql)) !== null) {
    console.log('Block', idx++, 'length:', match[1].length, 'preview:', match[1].substring(0, 60).replace(/\n/g, ' '));
    jsonBlocks.push(match[1].trim());
  }

  if (jsonBlocks.length !== 5) {
    console.error(`Expected 5 JSON blocks in seed_mock_tests.sql, found ${jsonBlocks.length}`);
    process.exit(1);
  }

  const readingContent = JSON.parse(jsonBlocks[0]);
  const readingAnswerKey = JSON.parse(jsonBlocks[1]);
  const writingContent = JSON.parse(jsonBlocks[2]);
  const cambridgeContent = JSON.parse(jsonBlocks[3]);
  const cambridgeAnswerKey = JSON.parse(jsonBlocks[4]);

  const tests = [
    {
      id: 'a1111111-1111-1111-1111-111111111111',
      title: 'Academic Reading Mock Test 1',
      test_category: 'full_mock',
      module_type: 'reading',
      is_premium: false,
      content_json: readingContent,
      answer_key_json: readingAnswerKey
    },
    {
      id: 'b2222222-2222-2222-2222-222222222222',
      title: 'Academic Writing Mock Test 1',
      test_category: 'full_mock',
      module_type: 'writing',
      is_premium: false,
      content_json: writingContent,
      answer_key_json: null
    },
    {
      id: 'c3333333-3333-3333-3333-333333333333',
      title: 'Cambridge 18 - Test 1 Reading',
      test_category: 'cambridge_companion',
      module_type: 'reading',
      is_premium: false,
      content_json: cambridgeContent,
      answer_key_json: cambridgeAnswerKey
    }
  ];

  console.log('Seeding tests into public.tests...');
  for (const test of tests) {
    const { data, error } = await supabase
      .from('tests')
      .upsert(test, { onConflict: 'id' })
      .select();

    if (error) {
      console.error(`Error inserting ${test.title}:`, error);
    } else {
      console.log(`✓ Successfully seeded: ${test.title} (${test.id})`);
    }
  }

  const { data: allTests, error: fetchErr } = await supabase.from('tests').select('id, title, module_type');
  console.log('\nCurrent tests in database:', allTests);
}

runSeed().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
