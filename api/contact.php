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
<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#0d0e1a;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0e1a;padding:40px 20px">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="background:#12132a;border-radius:12px;overflow:hidden;border:1px solid #1a1d3a">

  <!-- Header gradient bar -->
  <tr><td style="height:4px;background:linear-gradient(90deg,#00f0ff,#ff00ea,#00ff41,#00f0ff)"></td></tr>

  <!-- Logo / Title -->
  <tr><td style="padding:32px 36px 20px;text-align:center">
    <p style="margin:0 0 8px;font-family:'Courier New',monospace;font-size:11px;color:#4a5a6e;letter-spacing:4px;text-transform:uppercase">INCOMING TRANSMISSION</p>
    <h1 style="margin:0;font-family:'Courier New',monospace;font-size:22px;color:#00f0ff;font-weight:700;letter-spacing:1px">📩 Nouveau message</h1>
  </td></tr>

  <!-- Divider -->
  <tr><td style="padding:0 36px"><div style="height:1px;background:linear-gradient(90deg,transparent,#1e2345,transparent)"></div></td></tr>

  <!-- Sender info -->
  <tr><td style="padding:24px 36px">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:14px 18px;background:#0d0e1a;border-radius:8px;border:1px solid #1a1d3a">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-bottom:10px">
                <span style="font-size:11px;color:#4a5a6e;text-transform:uppercase;letter-spacing:2px">Expéditeur</span>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:8px">
                <span style="color:#00f0ff;font-size:13px;font-weight:600">👤</span>
                <span style="color:#e4f6ff;font-size:15px;font-weight:600;margin-left:8px">{$safeN}</span>
              </td>
            </tr>
            <tr>
              <td>
                <span style="color:#ff00ea;font-size:13px;font-weight:600">✉️</span>
                <a href="mailto:{$safeE}" style="color:#ff00ea;font-size:14px;text-decoration:none;margin-left:8px;border-bottom:1px dashed rgba(255,0,234,0.3)">{$safeE}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Message -->
  <tr><td style="padding:0 36px 28px">
    <p style="margin:0 0 10px;font-size:11px;color:#4a5a6e;text-transform:uppercase;letter-spacing:2px">Message</p>
    <div style="padding:20px;background:#0d0e1a;border-radius:8px;border:1px solid #1a1d3a;border-left:3px solid #00f0ff">
      <p style="margin:0;color:#c8d6e0;font-size:14px;line-height:1.8;white-space:pre-wrap">{$safeM}</p>
    </div>
  </td></tr>

  <!-- Footer divider -->
  <tr><td style="padding:0 36px"><div style="height:1px;background:linear-gradient(90deg,transparent,#1e2345,transparent)"></div></td></tr>

  <!-- Footer -->
  <tr><td style="padding:20px 36px 28px;text-align:center">
    <p style="margin:0 0 6px;font-family:'Courier New',monospace;font-size:10px;color:#2a3244;letter-spacing:1px">
      IP: {$ip}
    </p>
    <p style="margin:0;font-family:'Courier New',monospace;font-size:10px;color:#2a3244;letter-spacing:1px">
      {$date}
    </p>
  </td></tr>

  <!-- Bottom gradient bar -->
  <tr><td style="height:3px;background:linear-gradient(90deg,#00f0ff,#ff00ea,#00ff41,#00f0ff)"></td></tr>

</table>
</td></tr>
</table>
</body></html>
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
