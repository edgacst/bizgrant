# ---- Build Stage (ARM/x86 모두 지원) ----
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./

RUN chmod +x gradlew && ./gradlew dependencies --no-daemon || true

COPY src src
RUN ./gradlew bootJar --no-daemon -x test

# ---- Runtime Stage ----
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN addgroup -S bizgrant && adduser -S bizgrant -G bizgrant \
    && apk add --no-cache wget

COPY --from=builder /app/build/libs/*.jar app.jar

USER bizgrant

EXPOSE 8080

ENV JAVA_OPTS="-Xms256m -Xmx768m -XX:+UseG1GC"
ENV SPRING_PROFILES_ACTIVE=prod

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
