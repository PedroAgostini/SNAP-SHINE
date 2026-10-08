<?php
declare(strict_types=1);

/*
 * Antispam helpers for a future PHP form handler (PHP 8.1+).
 * This is NOT a submission endpoint and never sends or stores messages.
 * A future handler must add CSRF protection and server-side rate limiting,
 * call this validator, and only then connect the chosen delivery service.
 */
if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    http_response_code(503);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Robots-Tag: noindex, nofollow');
    echo json_encode(['ok' => false, 'message' => 'Quote submissions are disabled on this test website.']);
    exit;
}

/** Return validation errors; an empty array means only these checks passed. */
function snapshine_antispam_errors(array $fields): array
{
    $errors = [];
    $limits = ['company_website' => 0, 'name' => 120, 'email' => 254, 'phone' => 30, 'zip' => 5, 'service' => 80, 'date' => 10, 'message' => 5000];
    foreach ($limits as $key => $limit) {
        if (isset($fields[$key]) && (!is_string($fields[$key]) || strlen($fields[$key]) > $limit)) {
            $errors[$key] = 'Invalid field.';
        }
    }
    if ($errors) return $errors;

    $name = trim($fields['name'] ?? '');
    if ($name === '' || preg_match('/[\r\n\x00]/', $name)) $errors['name'] = 'Enter your name.';
    $email = trim($fields['email'] ?? '');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $email)) $errors['email'] = 'Enter a valid email.';
    if (!preg_match('/^\d{5}$/D', $fields['zip'] ?? '')) $errors['zip'] = 'Enter a 5-digit ZIP code.';
    $phone = $fields['phone'] ?? '';
    if (!preg_match('/^[+()\d .-]+$/D', $phone)) $errors['phone'] = 'Enter a US phone number.';
    $digits = preg_replace('/\D/', '', $phone);
    if (!preg_match('/^(?:1)?\d{10}$/D', $digits)) $errors['phone'] = 'Enter a US phone number.';

    $services = ['Regular Cleaning', 'Deep Cleaning', 'Move-In / Move-Out Cleaning', 'Post-Construction Cleaning', 'Commercial Cleaning'];
    if (!in_array($fields['service'] ?? '', $services, true)) $errors['service'] = 'Choose an available service.';
    $date = $fields['date'] ?? '';
    if ($date !== '') {
        $parsed = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
        if (!$parsed || $parsed->format('Y-m-d') !== $date) $errors['date'] = 'Enter a valid date.';
    }
    return $errors;
}
