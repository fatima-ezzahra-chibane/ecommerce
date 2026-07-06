<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json([
    'name' => 'E-Commerce API',
    'version' => '1.0',
    'docs' => '/api/v1',
]));
