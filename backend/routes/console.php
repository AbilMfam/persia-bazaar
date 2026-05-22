<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('db:ensure-created', function () {
    $connection = config('database.default');
    if ($connection !== 'mysql') {
        $this->info('Skipping: default connection is not mysql.');
        return 0;
    }

    /** @var array{host:string,port:int|string,database:string,username:string,password:string} $c */
    $c = config('database.connections.mysql');
    $name = (string) $c['database'];
    $dsnHost = sprintf('mysql:host=%s;port=%s', $c['host'], $c['port']);

    try {
        $pdo = new \PDO(
            $dsnHost,
            (string) $c['username'],
            (string) $c['password'],
            [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION],
        );
        $safeName = preg_replace('/[^a-zA-Z0-9_]/', '_', $name) ?: $name;
        $pdo->exec(sprintf(
            'CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
            $safeName,
        ));
        $this->info(sprintf('Database "%s" is ready.', $name));
    } catch (\Throwable $e) {
        $this->error($e->getMessage());

        return 1;
    }

    return 0;
})->purpose('CREATE DATABASE IF NOT EXISTS using current MySQL .env credentials (localhost / phpMyAdmin stack)');
