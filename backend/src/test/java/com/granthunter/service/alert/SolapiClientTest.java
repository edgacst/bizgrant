package com.granthunter.service.alert;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SolapiClientTest {

    @Test
    void createAuthorization_hasRequiredParts() {
        String auth = SolapiClient.createAuthorization("test-api-key", "test-secret");
        assertNotNull(auth);
        assertTrue(auth.startsWith("HMAC-SHA256 ApiKey=test-api-key"));
        assertTrue(auth.contains("Date="));
        assertTrue(auth.contains("Salt="));
        assertTrue(auth.contains("Signature="));
    }

    @Test
    void normalizePhone_stripsFormatting() {
        org.junit.jupiter.api.Assertions.assertEquals("01012345678",
                SolapiClient.normalizePhone("010-1234-5678"));
    }
}
