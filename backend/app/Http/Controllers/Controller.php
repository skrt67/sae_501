<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controllers\Middleware as ControllerMiddleware;

abstract class Controller
{
    public static function middleware(): array
    {
        return [
            new ControllerMiddleware('auth:sanctum', only: []),
        ];
    }
}
