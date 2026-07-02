<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BookTocService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetScSayScienceController extends Controller
{
    private BookTocService $serviceModel;

    /**
     * Inject constructor dependencies.
     */
    public function __construct(BookTocService $serviceModel)
    {
        $this->serviceModel = $serviceModel;
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $hadithMainId = $request->input('hadith_main_id');
        $typeId = $request->input('type_id');
        $query = trim((string) $request->input('q', ''));

        // Case 1: Load sciences/services linked to a specific Hadith
        if ($hadithMainId !== null) {
            $mainId = (int) $hadithMainId;

            $hadithIds = \Illuminate\Support\Facades\DB::table('htakhreeg as t1')
                ->join('htakhreeg as t2', 't1.GroupID', '=', 't2.GroupID')
                ->where('t1.HadithMainID', $mainId)
                ->pluck('t2.HadithMainID')
                ->push($mainId)
                ->unique()
                ->values()
                ->toArray();

            $services = $this->serviceModel->newQuery()
                ->join('hadithsservices as hs', 'booktoc_services.MainID', '=', 'hs.ServiceMainID')
                ->join('hadithsservicestypes as t', 'hs.TypeID', '=', 't.ID')
                ->whereIn('hs.HadithMainID', $hadithIds)
                ->select([
                    'booktoc_services.MainID as MainID',
                    'booktoc_services.BookName as BookName',
                    'booktoc_services.ID as HadithNum',
                    'booktoc_services.PartNum as PartNum',
                    'booktoc_services.PageNum as PageNum',
                    'booktoc_services.Tarf as Title',
                    'booktoc_services.CleanContent as CleanContent',
                    'booktoc_services.Annotations as Annotations',
                    't.Name as ServiceTypeName',
                    't.ID as ServiceTypeID',
                    'hs.HadithMainID as HadithMainID',
                ])
                ->get();

            $grouped = $services->groupBy(function ($item) {
                return $item->ServiceTypeID . '_' . $item->BookName;
            })->map(function ($items) use ($mainId) {
                $exactMatch = $items->firstWhere('HadithMainID', $mainId);
                if ($exactMatch) {
                    return $exactMatch;
                }
                return $items->first();
            })->values();

            $results = $grouped->map(function ($item) {
                unset($item->HadithMainID);
                return $item;
            });

            return $this->jsonResponse([
                'services' => $results->toArray(),
            ]);
        }

        // Case 2: Get a list of all service types
        if ($typeId === 'all') {
            $types = $this->serviceModel->getConnection()->select('SELECT ID, Name FROM hadithsservicestypes ORDER BY ID');

            return $this->jsonResponse([
                'types' => $types,
            ]);
        }

        // Case 3: Search science contents by query and optionally type_id
        $queryBuilder = $this->serviceModel->newQuery()
            ->join('hadithsservices as hs', 'booktoc_services.MainID', '=', 'hs.ServiceMainID')
            ->join('hadithsservicestypes as t', 'hs.TypeID', '=', 't.ID')
            ->select([
                'booktoc_services.MainID as MainID',
                'booktoc_services.BookName as BookName',
                'booktoc_services.ID as HadithNum',
                'booktoc_services.Tarf as Title',
                't.Name as ServiceTypeName',
            ]);

        if ($typeId !== null) {
            $queryBuilder->where('hs.TypeID', (int) $typeId);
        }

        if ($query !== '') {
            $queryBuilder->whereRaw('normalize_arabic(booktoc_services.CleanContent) LIKE normalize_arabic(?)', ['%'.$query.'%']);
        }

        $results = $queryBuilder
            ->limit(50)
            ->get();

        return $this->jsonResponse([
            'results' => $results->toArray(),
        ]);
    }
}
