package com.granthunter.config;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
@Getter
public class UploadPathConfig {

    @Value("${app.upload.path:./uploads}")
    private String configuredPath;

    private Path rootPath;

    @PostConstruct
    void init() throws IOException {
        rootPath = Paths.get(configuredPath).toAbsolutePath().normalize();
        Files.createDirectories(rootPath);
    }

    public Path userDir(Long userId) {
        return rootPath.resolve(String.valueOf(userId));
    }
}
