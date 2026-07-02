<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BookTocHadith;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GetHadithAnalysisTreeController extends Controller
{
    public function __invoke(Request $request, int $id = null): JsonResponse
    {
        $id = $id ?? (int) $request->input('id');
        if ($id <= 0) {
            return $this->errorResponse('Invalid Hadith ID', 400);
        }

        // 1. Fetch Hadith Base Information
        $hadith = BookTocHadith::find($id);
        if (!$hadith) {
            return $this->errorResponse('Hadith not found', 404);
        }

        // 2. Fetch Services State
        $services = DB::table('hadithservicesstate')->where('HadithMainID', $id)->first();

        // Initialize Tree
        $tree = [
            'id' => 'root',
            'label' => "الحديث: " . ($hadith->BookName ?? '') . " (حديث رقم " . ($hadith->ID ?? '') . ")",
            'icon' => 'BookOpen',
            'children' => []
        ];

        // 3. Hadith Text (Matn) Node
        $tree['children'][] = [
            'id' => 'matn',
            'label' => 'نص الحديث (المتن)',
            'icon' => 'FileText',
            'children' => [
                [
                    'id' => 'matn_content',
                    'label' => $hadith->CleanContent ?? $hadith->Tarf ?? '',
                    'icon' => 'MessageSquare'
                ]
            ]
        ];

        // 4. Hadith Type / Sanad Type
        $sanadTypesNode = [
            'id' => 'sanad_types',
            'label' => 'حالة الإسناد ونوع الحديث',
            'icon' => 'Tag',
            'children' => []
        ];

        // Fetch transmission chains to inspect types and narrators
        $chains = DB::table('asanedhadiths as ah')
            ->join('asaned as a', 'ah.SanadID', '=', 'a.ID')
            ->where('ah.HadithMainID', $id)
            ->select('a.ID', 'a.SandRwah', 'a.SandTypes')
            ->get();

        $allNarratorIds = [];
        $sanadTypeIds = [];
        foreach ($chains as $c) {
            if (!empty($c->SandRwah)) {
                $ids = array_filter(array_map('trim', explode(' ', $c->SandRwah)));
                $allNarratorIds = array_merge($allNarratorIds, $ids);
            }
            if (!empty($c->SandTypes)) {
                $tIds = array_filter(array_map('trim', explode(' ', $c->SandTypes)));
                $sanadTypeIds = array_merge($sanadTypeIds, $tIds);
            }
        }
        $allNarratorIds = array_values(array_unique($allNarratorIds));
        $sanadTypeIds = array_values(array_unique($sanadTypeIds));

        // Get Sanad Types text
        if (!empty($sanadTypeIds)) {
            $sanadTexts = DB::table('asanedtypes')->whereIn('ID', $sanadTypeIds)->pluck('Text')->toArray();
            foreach ($sanadTexts as $st) {
                $sanadTypesNode['children'][] = [
                    'id' => 'st_' . uniqid(),
                    'label' => $st,
                    'icon' => 'Info'
                ];
            }
        } else {
            $sanadTypesNode['children'][] = [
                'id' => 'st_unknown',
                'label' => 'غير محدد',
                'icon' => 'HelpCircle'
            ];
        }
        $tree['children'][] = $sanadTypesNode;

        // 5. Narrators & Transmission Chain Node
        if (!empty($allNarratorIds)) {
            $narratorsNode = [
                'id' => 'narrators',
                'label' => 'سلسلة الرواة',
                'icon' => 'Users',
                'children' => []
            ];

            // Fetch narrator details preserving order or grouping
            $narrators = DB::table('nouns')
                ->whereIn('ID', $allNarratorIds)
                ->select('ID', 'Name', 'Tabaqa', 'MartabaIbnHajar', 'DeathYear')
                ->get()
                ->keyBy('ID');

            // Construct chains
            foreach ($chains as $index => $c) {
                $chainIds = array_filter(array_map('trim', explode(' ', $c->SandRwah)));
                $chainChildren = [];
                foreach ($chainIds as $idx => $nid) {
                    if (isset($narrators[$nid])) {
                        $n = $narrators[$nid];
                        $label = $n->Name;
                        if (!empty($n->Tabaqa)) {
                            $label .= " (الطبقة: {$n->Tabaqa})";
                        }
                        if (!empty($n->MartabaIbnHajar)) {
                            $label .= " [{$n->MartabaIbnHajar}]";
                        }
                        $chainChildren[] = [
                            'id' => "narrator_{$c->ID}_{$nid}_{$idx}",
                            'label' => $label,
                            'icon' => 'User'
                        ];
                    }
                }
                $narratorsNode['children'][] = [
                    'id' => "chain_{$c->ID}",
                    'label' => "الإسناد رقم " . ($index + 1),
                    'icon' => 'GitCommit',
                    'children' => $chainChildren
                ];
            }
            $tree['children'][] = $narratorsNode;
        }

        // 6. Transmission Formats (صيغ الأداء)
        $tahdethNode = [
            'id' => 'tahdeth',
            'label' => 'صيغ الأداء والتحمل',
            'icon' => 'MessageCircle',
            'children' => []
        ];
        $tahdethStrings = DB::table('asanedhadiths as ah')
            ->join('asanedtahdeth as at', 'ah.SanadTahdethID', '=', 'at.ID')
            ->where('ah.HadithMainID', $id)
            ->pluck('at.SandTahdeth')
            ->toArray();

        $tahdethIds = [];
        foreach ($tahdethStrings as $str) {
            if (empty($str)) {
                continue;
            }
            preg_match_all('/(\d+)\$/', $str, $matches);
            if (!empty($matches[1])) {
                foreach ($matches[1] as $tId) {
                    $tahdethIds[] = (int) $tId;
                }
            }
        }
        $tahdethIds = array_values(array_unique($tahdethIds));

        $tahdethItems = [];
        if (!empty($tahdethIds)) {
            $tahdethItems = DB::table('asanedtahdethtypes')
                ->whereIn('ID', $tahdethIds)
                ->pluck('Text')
                ->toArray();
        }

        if (!empty($tahdethItems)) {
            foreach ($tahdethItems as $ti) {
                $tahdethNode['children'][] = [
                    'id' => 'ti_' . uniqid(),
                    'label' => $ti,
                    'icon' => 'Mic'
                ];
            }
            $tree['children'][] = $tahdethNode;
        }

        // 7. Authenticity Judgments (الحكم على الحديث)
        if ($services && isset($services->Degree) && $services->Degree == 1) {
            $judgments = DB::table('hadithjudgmenthits as h')
                ->join('hadithjudgmentsays as s', 'h.SayID', '=', 's.ID')
                ->join('hadithjudgmentscientists as sc', 's.ScientistID', '=', 'sc.ID')
                ->where('h.HadithMainID', $id)
                ->select('sc.Name as Scientist', 's.Say')
                ->get();

            if ($judgments->isNotEmpty()) {
                $judgmentsNode = [
                    'id' => 'judgments',
                    'label' => 'أقوال علماء الجرح والتعديل والحكم عليه',
                    'icon' => 'Scale',
                    'children' => []
                ];
                foreach ($judgments as $j) {
                    $judgmentsNode['children'][] = [
                        'id' => 'j_' . uniqid(),
                        'label' => "{$j->Scientist}: {$j->Say}",
                        'icon' => 'CheckCircle'
                    ];
                }
                $tree['children'][] = $judgmentsNode;
            }
        }

        // 8. Subject Topics (شجرة الموضوعات)
        if ($services && isset($services->Subjects) && $services->Subjects == 1) {
            $subjects = DB::table('subjecthit as sh')
                ->join('subject as s', 'sh.SubjectID', '=', 's.ID')
                ->where('sh.ParagraphMainID', $id)
                ->select('s.SubjectTitle')
                ->distinct()
                ->pluck('SubjectTitle')
                ->toArray();

            if (!empty($subjects)) {
                $subjectsNode = [
                    'id' => 'subjects',
                    'label' => 'التصنيف الموضوعي',
                    'icon' => 'Folder',
                    'children' => []
                ];
                foreach ($subjects as $s) {
                    $subjectsNode['children'][] = [
                        'id' => 's_' . uniqid(),
                        'label' => $s,
                        'icon' => 'Bookmark'
                    ];
                }
                $tree['children'][] = $subjectsNode;
            }
        }

        // 9. Witnesses (الشواهد والمتابعات)
        if ($services && isset($services->Shawahed) && $services->Shawahed == 1) {
            $shawahedCount = DB::table('hadithshawahed')
                ->where('HadithMainID', $id)
                ->count();

            if ($shawahedCount > 0) {
                $tree['children'][] = [
                    'id' => 'shawahed',
                    'label' => "الشواهد والمتابعات (عدد الشواهد المتوفرة: {$shawahedCount})",
                    'icon' => 'Eye',
                    'children' => [
                        [
                            'id' => 'shawahed_link',
                            'label' => 'يمكن استعراض تفاصيل الشواهد عبر قسم الشواهد في البطاقة',
                            'icon' => 'ExternalLink'
                        ]
                    ]
                ];
            }
        }

        return $this->jsonResponse([
            'success' => true,
            'data' => $tree
        ]);
    }
}
