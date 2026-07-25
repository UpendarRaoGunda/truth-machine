package com.truthmachine.app;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public final class QuoteRepository {
    private static final List<Quote> QUOTES = Collections.unmodifiableList(Arrays.asList(
        new Quote(
            "You are a fish that learned to worry about Mercury retrograde.",
            "Humans are tetrapod vertebrates. Astrology has not demonstrated reliable predictive power in controlled tests."
        ),
        new Quote(
            "A confident claim is not the same thing as a tested claim.",
            "Confidence is a feature of the speaker. Evidence is a feature of the world."
        ),
        new Quote(
            "The universe is under no obligation to respect our favourite explanation.",
            "A useful explanation must survive observation, testing, and competing explanations."
        ),
        new Quote(
            "Tradition tells you how long an idea survived. Evidence tells you whether it should.",
            "Age can explain cultural importance, but it cannot replace a fair test."
        ),
        new Quote(
            "The cat crossed the road. It did not take control of probability.",
            "Coincidence and selective memory can make unrelated events feel causally connected."
        ),
        new Quote(
            "An eclipse changes the light. It does not remotely poison your lunch.",
            "Food safety depends on contamination, handling, storage, and temperature—not an astronomical shadow."
        ),
        new Quote(
            "Your phone uses a spherical Earth while someone uses that phone to deny it.",
            "Navigation, geodesy, horizons, gravity, and orbital mechanics converge on the same Earth model."
        ),
        new Quote(
            "Being corrected is not losing. It is the moment your map becomes less wrong.",
            "Reliable knowledge improves by exposing errors instead of protecting them."
        ),
        new Quote(
            "Nature does not grade us for sincerity.",
            "A belief can be deeply honest and still fail when compared with measurements."
        ),
        new Quote(
            "The plural of anecdote is still not a controlled experiment.",
            "Personal stories can generate questions, but they do not isolate cause, chance, bias, or confounding."
        ),
        new Quote(
            "Extraordinary claims do not need louder voices. They need stronger evidence.",
            "The less a claim fits established evidence, the more independent support it must provide."
        ),
        new Quote(
            "A mystery is an invitation to investigate, not permission to invent.",
            "Saying “we do not know yet” is more accurate than filling a gap with an unsupported answer."
        ),
        new Quote(
            "Your brain is a pattern detector with a false-positive problem.",
            "Humans naturally detect agency and meaning, even in coincidence and noise."
        ),
        new Quote(
            "A graph can wear a lab coat and still lie.",
            "Axes, denominators, time windows, and missing context can reverse the impression created by a chart."
        ),
        new Quote(
            "The first explanation is often the fastest, not the best.",
            "Comparing alternatives helps prevent confirmation bias and premature certainty."
        ),
        new Quote(
            "If a claim cannot risk being wrong, it cannot earn the right to be called tested.",
            "Falsifiability matters because evidence must be able to count against an explanation."
        ),
        new Quote(
            "Evolution did not design you from scratch. It edited a very old draft.",
            "Bodies contain inherited structures, compromises, and repurposed parts shaped by common ancestry."
        ),
        new Quote(
            "A million shares can measure popularity. They cannot measure truth.",
            "Virality rewards emotion and novelty; verification requires sources, context, and independent checks."
        ),
        new Quote(
            "Uncertainty is not scientific weakness. Hidden uncertainty is.",
            "Good evidence communication separates what is known, estimated, disputed, and still unknown."
        ),
        new Quote(
            "Before asking who benefits, first ask whether the claim is even true.",
            "Motives can matter, but they cannot substitute for evaluating the evidence itself."
        ),
        new Quote(
            "Correlation is where investigation begins, not where causation is declared.",
            "Causal claims require timing, mechanism, controls, and competing explanations to be addressed."
        ),
        new Quote(
            "Your memory is an editor, not a camera.",
            "Recall is reconstructive and can change with suggestion, emotion, repetition, and later information."
        ),
        new Quote(
            "A source is not trustworthy because it agrees with you.",
            "Source quality depends on methods, transparency, expertise, corrections, and independent confirmation."
        ),
        new Quote(
            "The easiest fact to check is often the one a rumour hopes you will skip.",
            "Dates, original documents, full quotations, and earlier image versions frequently expose misleading context."
        ),
        new Quote(
            "Science is organised doubt with receipts.",
            "Claims gain strength through reproducible methods, transparent data, criticism, and correction."
        ),
        new Quote(
            "Your ancestors survived without knowing genetics. That does not make genetics optional.",
            "Survival can happen with incomplete explanations; modern decisions improve when mechanisms are understood."
        ),
        new Quote(
            "A prediction made after the event is not a prediction.",
            "Useful forecasts must be specific, recorded in advance, and evaluated against failures as well as successes."
        ),
        new Quote(
            "When every outcome confirms the theory, the theory is protecting itself from reality.",
            "A testable explanation must specify results that would count against it."
        ),
        new Quote(
            "The screenshot may be real while the story attached to it is false.",
            "Media verification requires provenance, date, location, edits, and the original context."
        ),
        new Quote(
            "The goal is not to win the argument. It is to leave with fewer wrong beliefs.",
            "Truth-seeking works best when people can update without humiliation."
        ),
        new Quote(
            "Reality has no customer-support desk for beliefs.",
            "The world does not change because a claim is comforting, popular, or repeated."
        )
    ));

    private QuoteRepository() {
    }

    public static Quote forDate(LocalDate date) {
        long index = Math.floorMod(date.toEpochDay(), QUOTES.size());
        return QUOTES.get((int) index);
    }

    public static Quote today() {
        return forDate(LocalDate.now());
    }

    public static int size() {
        return QUOTES.size();
    }

    public static List<Quote> all() {
        return QUOTES;
    }
}
