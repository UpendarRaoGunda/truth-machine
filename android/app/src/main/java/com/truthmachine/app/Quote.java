package com.truthmachine.app;

public final class Quote {
    private final String line;
    private final String evidence;

    public Quote(String line, String evidence) {
        this.line = line;
        this.evidence = evidence;
    }

    public String line() {
        return line;
    }

    public String evidence() {
        return evidence;
    }
}
