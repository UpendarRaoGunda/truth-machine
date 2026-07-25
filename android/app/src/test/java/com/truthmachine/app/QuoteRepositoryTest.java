package com.truthmachine.app;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;

import org.junit.Test;

import java.time.LocalDate;

public final class QuoteRepositoryTest {
    @Test
    public void dateSelectionIsDeterministic() {
        LocalDate date = LocalDate.of(2026, 7, 25);
        assertEquals(QuoteRepository.forDate(date).line(), QuoteRepository.forDate(date).line());
        assertEquals(QuoteRepository.forDate(date).evidence(), QuoteRepository.forDate(date).evidence());
    }

    @Test
    public void everyQuoteHasEvidence() {
        assertFalse(QuoteRepository.all().isEmpty());
        for (Quote quote : QuoteRepository.all()) {
            assertNotNull(quote);
            assertFalse(quote.line().trim().isEmpty());
            assertFalse(quote.evidence().trim().isEmpty());
        }
    }

    @Test
    public void repositoryContainsAFullMonth() {
        assertEquals(31, QuoteRepository.size());
    }
}
