<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json([
    'name' => 'Vivid API',
    'version' => '1.0',
    'api' => '/api/v1/products',
    'health' => '/up',
]));
