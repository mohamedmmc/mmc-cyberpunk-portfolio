<?php
/* =========================================================
   contact.php — Portfolio contact form handler
   Receives JSON POST, sends email via OVH SMTP (SSL)
   Credentials loaded from config.php (gitignored)
   ========================================================= */

// Load credentials
$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'server-not-configured']);
    exit;
}
require_once $configPath;

// CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'method-not-allowed']);
    exit;
}

// --- Parse input ---
$raw = file_get_contents('php://input');
$input = json_decode($raw, true);

$name    = trim($input['name']    ?? '');
$email   = trim($input['email']   ?? '');
$message = trim($input['message'] ?? '');

// --- Validate ---
if (!$name || !$email || !$message) {
    http_response_code(400);
    echo json_encode(['error' => 'missing-fields']);
    exit;
}
if (strlen($name) > 100 || strlen($email) > 100 || strlen($message) > 5000) {
    http_response_code(400);
    echo json_encode(['error' => 'fields-too-long']);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'invalid-email']);
    exit;
}

// --- Rate limit (1 per IP per 5 min, file-based) ---
$rlDir = __DIR__ . '/.ratelimit';
if (!is_dir($rlDir)) @mkdir($rlDir, 0700, true);
$ipHash = substr(hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|mmc-salt'), 0, 12);
$rlFile = "$rlDir/$ipHash";
if (file_exists($rlFile) && (time() - filemtime($rlFile)) < 300) {
    http_response_code(429);
    echo json_encode(['error' => 'rate-limited', 'retry_after' => 300]);
    exit;
}
@touch($rlFile);

// Cleanup old rate-limit files (>10 min)
foreach (glob("$rlDir/*") as $f) {
    if (time() - filemtime($f) > 600) @unlink($f);
}

// --- Build email ---
$subject = "[Portfolio] Message de $name";
$date = date('r');
$safeN = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$safeE = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$safeM = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));
$ip = $_SERVER['REMOTE_ADDR'] ?? '?';

$html = <<<HTML
<div style="font-family:'Courier New',monospace;max-width:600px;margin:0 auto;padding:24px;background:#0a0b18;color:#e4f6ff;border:1px solid rgba(0,240,255,0.3);border-radius:8px">
  <h2 style="color:#00f0ff;margin:0 0 16px;font-size:18px">📩 Nouveau message — Portfolio</h2>
  <p style="margin:8px 0"><strong style="color:#00f0ff">Nom :</strong> {$safeN}</p>
  <p style="margin:8px 0"><strong style="color:#00f0ff">Email :</strong> <a href="mailto:{$safeE}" style="color:#ff00ea">{$safeE}</a></p>
  <hr style="border:none;border-top:1px solid rgba(0,240,255,0.2);margin:16px 0">
  <div style="white-space:pre-wrap;line-height:1.7;font-size:14px">{$safeM}</div>
  <hr style="border:none;border-top:1px solid rgba(0,240,255,0.2);margin:16px 0">
  <p style="color:#4a5a6e;font-size:11px">IP: {$ip} · {$date}</p>
</div>
HTML;

// --- Send via SMTP over SSL ---
$sent = smtpSend(
    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
    SMTP_USER,   // from
    CONTACT_TO,  // to
    $subject,
    $html,
    $email       // reply-to
);

if ($sent === true) {
    echo json_encode(['ok' => true, 'message' => 'sent']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'send-failed', 'detail' => $sent]);
}

// =========================================================
// Minimal SMTP client — SSL + AUTH LOGIN
// =========================================================
function smtpSend($host, $port, $user, $pass, $from, $to, $subject, $htmlBody, $replyTo) {
    $sock = @stream_socket_client(
        "ssl://$host:$port",
        $errno, $errstr, 15,
        STREAM_CLIENT_CONNECT,
        stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true]])
    );
    if (!$sock) return "connect-failed: $errstr ($errno)";

    $greeting = smtpRead($sock);
    if (!str_starts_with($greeting, '220')) return "greeting: $greeting";

    // EHLO
    smtpWrite($sock, 'EHLO portfolio.local');
    $ehlo = smtpReadMulti($sock);

    // AUTH LOGIN
    smtpWrite($sock, 'AUTH LOGIN');
    $r = smtpRead($sock);
    if (!str_starts_with($r, '334')) return "auth-init: $r";

    smtpWrite($sock, base64_encode($user));
    $r = smtpRead($sock);
    if (!str_starts_with($r, '334')) return "auth-user: $r";

    smtpWrite($sock, base64_encode($pass));
    $r = smtpRead($sock);
    if (!str_starts_with($r, '235')) return "auth-pass: $r";

    // MAIL FROM
    smtpWrite($sock, "MAIL FROM:<$from>");
    $r = smtpRead($sock);
    if (!str_starts_with($r, '250')) return "mail-from: $r";

    // RCPT TO
    smtpWrite($sock, "RCPT TO:<$to>");
    $r = smtpRead($sock);
    if (!str_starts_with($r, '250')) return "rcpt-to: $r";

    // DATA
    smtpWrite($sock, 'DATA');
    $r = smtpRead($sock);
    if (!str_starts_with($r, '354')) return "data: $r";

    // Compose message
    $boundary = md5(uniqid(time()));
    $msg  = "From: $from\r\n";
    $msg .= "To: $to\r\n";
    $msg .= "Reply-To: $replyTo\r\n";
    $msg .= "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";
    $msg .= "Date: " . date('r') . "\r\n";
    $msg .= "MIME-Version: 1.0\r\n";
    $msg .= "Content-Type: text/html; charset=UTF-8\r\n";
    $msg .= "Content-Transfer-Encoding: base64\r\n";
    $msg .= "\r\n";
    $msg .= chunk_split(base64_encode($htmlBody));
    $msg .= "\r\n.\r\n";

    fwrite($sock, $msg);
    $r = smtpRead($sock);

    smtpWrite($sock, 'QUIT');
    @fclose($sock);

    return str_starts_with($r, '250') ? true : "send: $r";
}

function smtpWrite($sock, $cmd) {
    fwrite($sock, "$cmd\r\n");
}

function smtpRead($sock) {
    $line = '';
    while ($chunk = @fgets($sock, 512)) {
        $line .= $chunk;
        if (isset($chunk[3]) && $chunk[3] === ' ') break;
        if (strlen($chunk) < 4) break;
    }
    return trim($line);
}

function smtpReadMulti($sock) {
    $lines = '';
    while ($chunk = @fgets($sock, 512)) {
        $lines .= $chunk;
        if (isset($chunk[3]) && $chunk[3] === ' ') break;
    }
    return trim($lines);
}
