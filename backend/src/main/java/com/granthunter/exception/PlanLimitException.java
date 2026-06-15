package com.granthunter.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class PlanLimitException extends RuntimeException {

    private final String plan;
    private final String requiredPlan;

    public PlanLimitException(String message) {
        super(message);
        this.plan = null;
        this.requiredPlan = null;
    }

    public PlanLimitException(String message, String plan, String requiredPlan) {
        super(message);
        this.plan = plan;
        this.requiredPlan = requiredPlan;
    }

    public String getPlan() {
        return plan;
    }

    public String getRequiredPlan() {
        return requiredPlan;
    }
}
