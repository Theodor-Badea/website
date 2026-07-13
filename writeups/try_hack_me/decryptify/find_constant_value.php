<?php

$email = "alpha@fake.thm";
$desired_random = 1348337122;

// Brute-force the constant_value
function find_constant_value($email, $desired_random) {
    $email_length = strlen($email);
    $email_hex = hexdec(substr($email, 0, 8));

    for ($constant_value = 0; $constant_value <= 9999999; $constant_value++) {
        $seed_value = hexdec($email_length + $constant_value + $email_hex);

        mt_srand($seed_value);
        $random = mt_rand();

        if ($random === $desired_random) {
            return $constant_value;
        }
    }

    return null;
}

$constant = find_constant_value($email, $desired_random);

if ($constant !== null) {
    echo "[+] Found constant_value: $constant\n";

    // Verify
    $email_length = strlen($email);
    $email_hex = hexdec(substr($email, 0, 8));

    $seed_value = hexdec($email_length + $constant + $email_hex);

    mt_srand($seed_value);
    $random = mt_rand();
    $invite_code = base64_encode($random);

    echo "[+] Seed:        $seed_value\n";
    echo "[+] Random:      $random\n";
    echo "[+] Invite code: $invite_code\n";
} else {
    echo "[-] constant_value not found in searched range.\n";
}
