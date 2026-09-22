package com.Maathacare.Backend.config;

import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    private static final Logger log =
            LoggerFactory.getLogger(FirebaseConfig.class);

    @PostConstruct
    public void initialize() {
        // Avoid initializing the default Firebase app more than once.
        boolean alreadyInitialized = FirebaseApp.getApps().stream()
                .anyMatch(app ->
                        FirebaseApp.DEFAULT_APP_NAME.equals(app.getName()));

        if (alreadyInitialized) {
            log.info("Firebase Admin SDK is already initialized.");
            return;
        }

        // Read the JSON contents from the Railway environment variable.
        String credentialsJson =
                System.getenv("FIREBASE_SERVICE_ACCOUNT_JSON");

        if (credentialsJson == null || credentialsJson.isBlank()) {
            throw new IllegalStateException(
                    "FIREBASE_SERVICE_ACCOUNT_JSON is missing or empty."
            );
        }

        log.info("Initializing Firebase Admin SDK from environment variable.");

        try (InputStream serviceAccount = new ByteArrayInputStream(
                credentialsJson.getBytes(StandardCharsets.UTF_8))) {

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(
                            ServiceAccountCredentials.fromStream(serviceAccount)
                    )
                    .build();

            FirebaseApp.initializeApp(options);

            log.info("Firebase Admin SDK initialized successfully.");

        } catch (Exception e) {
            // Do not print credentials or raw parsing errors into the logs.
            log.error(
                    "Firebase initialization failed ({}). Check the credentials variable.",
                    e.getClass().getSimpleName()
            );

            throw new IllegalStateException(
                    "Firebase initialization failed. Check FIREBASE_SERVICE_ACCOUNT_JSON."
            );
        }
    }
}
