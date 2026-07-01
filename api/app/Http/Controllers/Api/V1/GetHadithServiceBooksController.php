<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GetHadithServiceBooksController extends Controller
{
    public function __invoke($hadithId)
    {
        $services = DB::table('hadithsservices as hs')
            ->join('booktoc_services as bts', 'hs.ServiceMainID', '=', 'bts.MainID')
            ->join('hadithsservicestypes as hst', 'hs.TypeID', '=', 'hst.ID')
            ->where('hs.HadithMainID', $hadithId)
            ->select(
                'hst.Name as TypeName',
                'bts.BookName',
                'bts.PartNum',
                'bts.PageNum',
                'bts.MainID as service_id'
            )
            ->get();

        $grouped = [];
        foreach ($services as $service) {
            $typeName = $service->TypeName;
            if (!isset($grouped[$typeName])) {
                $grouped[$typeName] = [];
            }
            $grouped[$typeName][] = [
                'book_name' => $service->BookName,
                'part' => $service->PartNum,
                'page' => $service->PageNum,
                'service_id' => $service->service_id
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => $grouped
        ]);
    }
}
