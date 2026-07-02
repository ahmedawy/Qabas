<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GetHadithServiceBooksController extends Controller
{
    public function __invoke($hadithId)
    {
        $hadithIds = DB::table('htakhreeg as t1')
            ->join('htakhreeg as t2', 't1.GroupID', '=', 't2.GroupID')
            ->where('t1.HadithMainID', $hadithId)
            ->pluck('t2.HadithMainID')
            ->push($hadithId)
            ->unique()
            ->values()
            ->toArray();

        $services = DB::table('hadithsservices as hs')
            ->join('booktoc_services as bts', 'hs.ServiceMainID', '=', 'bts.MainID')
            ->join('hadithsservicestypes as hst', 'hs.TypeID', '=', 'hst.ID')
            ->whereIn('hs.HadithMainID', $hadithIds)
            ->where('hs.TypeID', 8)
            ->select(
                'hst.Name as TypeName',
                'bts.BookName',
                'bts.PartNum',
                'bts.PageNum',
                'bts.BookID as service_id',
                'hs.HadithMainID'
            )
            ->get();

        $grouped = [];
        $byType = $services->groupBy('TypeName');

        foreach ($byType as $typeName => $items) {
            $deduplicated = $items->groupBy('BookName')->map(function ($bookItems) use ($hadithId) {
                $exactMatch = $bookItems->firstWhere('HadithMainID', (int) $hadithId);
                if ($exactMatch) {
                    return $exactMatch;
                }
                return $bookItems->first();
            })->values();

            $grouped[$typeName] = [];
            foreach ($deduplicated as $service) {
                $grouped[$typeName][] = [
                    'book_name' => $service->BookName,
                    'part' => $service->PartNum,
                    'page' => $service->PageNum,
                    'service_id' => $service->service_id
                ];
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => $grouped
        ]);
    }
}
