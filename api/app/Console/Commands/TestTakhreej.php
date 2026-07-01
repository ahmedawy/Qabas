<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\BookTocHadith;

class TestTakhreej extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:takhreej {hadith=5}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the dynamic generation of Takhreej data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $hadithId = $this->argument('hadith');
        
        // 1. Get GroupID from HTakhreeg
        $group = DB::table('htakhreeg')->where('HadithMainID', $hadithId)->first();
        if (!$group) {
            $this->error("No Takhreej found for Hadith $hadithId");
            return;
        }

        // 2. Get all HadithMainIDs for that group (excluding the current one optionally, but let's include it to see)
        // Wait, the output includes the current hadith if it has another variation, or maybe we just want to list all related.
        $relatedTakhreej = DB::table('htakhreeg')->where('GroupID', $group->GroupID)->get();
        
        $results = [];
        
        foreach ($relatedTakhreej as $tak) {
            $relatedId = $tak->HadithMainID;
            
            // Get book and details
            $hadithData = DB::table('booktoc_hadith')->where('MainID', $relatedId)->first();
            if (!$hadithData) continue;
            
            $bookId = $hadithData->BookID;
            $bookName = trim($hadithData->BookName);
            $volume = $hadithData->PartNum;
            $page = $hadithData->PageNum;
            $number = trim((string)$hadithData->TarqeemMatboa1);
            
            // Get Chapter Path (Medium mode)
            // Query ancestors
            $ancestors = DB::select("
                WITH RECURSIVE HierarchyCTE AS (
                    SELECT MainID, ParentID, CleanContent, 1 AS Level
                    FROM booktoc_hadith
                    WHERE MainID = ? AND IsLeaf = 0
                    UNION ALL
                    SELECT parent.MainID, parent.ParentID, parent.CleanContent, child.Level + 1 AS Level
                    FROM booktoc_hadith parent
                    INNER JOIN HierarchyCTE child ON child.ParentID = parent.MainID
                    WHERE parent.IsLeaf = 0
                )
                SELECT CleanContent FROM HierarchyCTE ORDER BY Level DESC
            ", [$hadithData->ParentID]);
            
            $chapters = array_map(function($a) { return trim($a->CleanContent); }, $ancestors);
            $chapterPath = implode(" ، ", $chapters);
            
            // Get Match Comment (Detailed mode)
            // The master could be either the current hadith or the related one
            $comment = "";
            $comparisonTable = "hmatncomparison{$bookId}";
            
            try {
                $comp = DB::table($comparisonTable)
                    ->where(function($q) use ($hadithId, $relatedId) {
                        $q->where('MasterMatnID', $hadithId)->where('SlaveMatnID', $relatedId);
                    })
                    ->orWhere(function($q) use ($hadithId, $relatedId) {
                        $q->where('MasterMatnID', $relatedId)->where('SlaveMatnID', $hadithId);
                    })
                    ->first();
                    
                if ($comp) {
                    $comment = trim($comp->Comment);
                }
            } catch (\Exception $e) {
                // Table might not exist
            }
            
            // Format
            if (!isset($results[$bookName])) {
                $results[$bookName] = [];
            }
            
            $results[$bookName][] = [
                'general' => "($volume / $page) برقم: ($number)",
                'medium' => $chapterPath ? "( $chapterPath )" : "",
                'detailed' => $comment ? "($comment)" : ""
            ];
        }
        
        $this->info("=== Takhreej Results for Hadith $hadithId ===\n");
        
        foreach ($results as $book => $hadiths) {
            $this->info("أخرجه $book");
            foreach ($hadiths as $h) {
                $this->line("  -> General: " . $h['general']);
                $this->line("  -> Medium:  " . $h['medium']);
                $this->line("  -> Detailed: " . $h['detailed']);
            }
            $this->line("");
        }
    }
}
