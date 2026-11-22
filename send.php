<?php
/* ==========================================================
   UniShop — обработчик форм сайта (отправка заявок на почту)
   Работает на любом хостинге с PHP 7.4+ (функция mail()).
   Принимает POST от js/app.js и отвечает JSON: {"ok":true}.

   НАСТРОЙКА — меняйте только блок CONFIG ниже.
   ========================================================== */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

/* ---------- CONFIG ---------- */
const MAIL_TO   = 'Partnership.unishop@gmail.com';  // куда приходят заявки
const MAIL_FROM = '';          // отправитель, лучше адрес на домене сайта, напр. no-reply@unishop.by
                               // (пусто = no-reply@<домен сайта>)
const TG_TOKEN  = '';          // необязательно: токен Telegram-бота (@BotFather)
const TG_CHAT   = '';          // необязательно: ID чата/канала, куда бот пришлёт копию заявки
const MIN_SECONDS_BETWEEN = 20; // защита от спама: не чаще 1 заявки в N секунд с одного IP
/* ---------------------------- */

function answer(bool $ok, string $error = '', int $code = 200): void {
    http_response_code($code);
    echo json_encode(['ok' => $ok, 'error' => $error], JSON_UNESCAPED_UNICODE);
    exit;
}
function clean(string $key, int $max = 2000): string {
    $v = isset($_POST[$key]) && is_string($_POST[$key]) ? $_POST[$key] : '';
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $v) ?? '';
    return mb_substr(trim($v), 0, $max);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') answer(false, 'method', 405);

// Ловушка для ботов: скрытое поле заполнено — делаем вид, что всё хорошо, но ничего не отправляем
if (clean('website') !== '') answer(true);

// Ограничение частоты по IP
$ip   = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$lock = sys_get_temp_dir() . '/unishop_form_' . md5($ip);
if (is_file($lock) && time() - (int)@filemtime($lock) < MIN_SECONDS_BETWEEN) answer(false, 'too_fast', 429);

$name  = clean('name', 120);
$phone = clean('phone', 60);
$email = clean('email', 160);
if ($name === '' || strlen(preg_replace('/\D/', '', $phone) ?? '') < 7) answer(false, 'validation', 422);
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) answer(false, 'email', 422);

$form = clean('form', 120) ?: 'Форма на сайте';
$rows = [
    'Форма'            => $form,
    'Имя'              => $name,
    'Телефон'          => $phone,
    'Email'            => $email,
    'Техника'          => clean('tech', 200),
    'Описание/сообщение' => clean('desc') ?: clean('msg'),
    'Страница'         => clean('page', 300),
    'IP'               => $ip,
    'Время'            => date('Y-m-d H:i:s'),
];
$body = '';
foreach ($rows as $k => $v) if ($v !== '') $body .= $k . ': ' . $v . "\n";

$host = preg_replace('/[^a-z0-9.\-]/i', '', $_SERVER['HTTP_HOST'] ?? 'localhost') ?: 'localhost';
$from = MAIL_FROM !== '' ? MAIL_FROM : 'no-reply@' . preg_replace('/^www\./', '', $host);
$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: =?UTF-8?B?' . base64_encode('Сайт UniShop') . '?= <' . $from . '>',
];
if ($email !== '') $headers[] = 'Reply-To: ' . str_replace(["\r", "\n"], '', $email);
$subject = '=?UTF-8?B?' . base64_encode('Заявка с сайта UniShop: ' . $form) . '?=';

$sent = @mail(MAIL_TO, $subject, $body, implode("\r\n", $headers));

// Копия в Telegram (по желанию)
$tg = false;
if (TG_TOKEN !== '' && TG_CHAT !== '') {
    $ctx = stream_context_create(['http' => [
        'method' => 'POST', 'timeout' => 6,
        'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
        'content' => http_build_query(['chat_id' => TG_CHAT, 'text' => "Заявка с сайта UniShop\n\n" . $body]),
    ]]);
    $tg = @file_get_contents('https://api.telegram.org/bot' . TG_TOKEN . '/sendMessage', false, $ctx) !== false;
}

if (!$sent && !$tg) answer(false, 'send_failed', 500);
@touch($lock);
answer(true);
