<?php

declare(strict_types=1);

use App\Http\Middleware\ForceJsonResponse;
use Illuminate\Auth\AccessDeniedException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [
            ForceJsonResponse::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->wantsJson()) {
                $statusCode = 500;
                $message = $e->getMessage() ?: 'An unexpected error occurred.';
                $errors = null;

                if ($e instanceof ValidationException) {
                    $statusCode = 422;
                    $message = 'The given data was invalid.';
                    $errors = $e->errors();
                } elseif ($e instanceof ModelNotFoundException) {
                    $statusCode = 404;
                    $message = 'Resource not found.';
                } elseif ($e instanceof NotFoundHttpException) {
                    $statusCode = 404;
                    $message = 'Endpoint not found.';
                } elseif ($e instanceof AuthenticationException) {
                    $statusCode = 401;
                    $message = 'Unauthenticated.';
                } elseif ($e instanceof AccessDeniedException || $e instanceof AccessDeniedHttpException) {
                    $statusCode = 403;
                    $message = 'This action is unauthorized.';
                } elseif ($e instanceof MethodNotAllowedHttpException) {
                    $statusCode = 405;
                    $message = 'Method not allowed.';
                } elseif ($e instanceof HttpException) {
                    $statusCode = $e->getStatusCode();
                    $message = $e->getMessage();
                }

                $response = [
                    'success' => false,
                    'error' => $message,
                ];

                if ($errors !== null) {
                    $response['errors'] = $errors;
                }

                // Retrieve debug state via application instance or config helper safely
                if (config('app.debug') === true && $statusCode === 500) {
                    $response['debug'] = [
                        'exception' => get_class($e),
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                    ];
                }

                return response()->json($response, $statusCode);
            }

            return null;
        });
    })->create();
