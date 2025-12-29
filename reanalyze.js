// Script to re-analyze all existing entries with improved sentiment algorithm
const { supabase } = require('./supabaseClient');
const { analyzeJournal } = require('./ai/analyser');

async function reanalyzeAllEntries() {
  try {
    console.log('🔄 Starting re-analysis of all entries...\n');
    
    // Get all entries from database
    const { data: entries, error: fetchError } = await supabase
      .from('journal_entries')
      .select('id, content, user_id')
      .order('date', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching entries:', fetchError.message);
      return;
    }

    if (!entries || entries.length === 0) {
      console.log('ℹ️  No entries found to analyze');
      return;
    }

    console.log(`📊 Found ${entries.length} entries to re-analyze\n`);

    let successCount = 0;
    let errorCount = 0;

    // Analyze and update each entry
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      
      try {
        // Analyze with improved algorithm
        const result = analyzeJournal(entry.content);
        
        // Update entry in database
        const { error: updateError } = await supabase
          .from('journal_entries')
          .update({
            emotion: result.emotion || 'neutral',
            sentiment: result.sentiment_score || 0.5,
            mood_label: result.emotion || 'neutral',
            ai_reflection: result.reflective_prompt || null
          })
          .eq('id', entry.id);

        if (updateError) {
          console.error(`❌ Error updating entry ${i + 1}:`, updateError.message);
          errorCount++;
        } else {
          successCount++;
          process.stdout.write(`\r✅ Progress: ${successCount}/${entries.length} entries analyzed`);
        }
      } catch (err) {
        console.error(`\n❌ Error analyzing entry ${i + 1}:`, err.message);
        errorCount++;
      }
    }

    console.log(`\n\n🎉 Re-analysis complete!`);
    console.log(`   ✅ Successfully updated: ${successCount}`);
    if (errorCount > 0) {
      console.log(`   ❌ Errors: ${errorCount}`);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

// Run the script
reanalyzeAllEntries()
  .then(() => {
    console.log('\n✨ Done! Check your entries page to see the improved analysis.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Script failed:', err);
    process.exit(1);
  });
