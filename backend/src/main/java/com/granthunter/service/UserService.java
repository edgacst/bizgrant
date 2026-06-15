package com.granthunter.service;

import com.granthunter.entity.User;
import com.granthunter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 사용자 관리 서비스
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Transactional
    public User updateUser(Long id, User updates) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + id));

        if (updates.getName() != null) user.setName(updates.getName());
        if (updates.getPhone() != null) user.setPhone(updates.getPhone());
        if (updates.getCompanyName() != null) user.setCompanyName(updates.getCompanyName());
        if (updates.getIndustry() != null) user.setIndustry(updates.getIndustry());
        if (updates.getCompanySize() != null) user.setCompanySize(updates.getCompanySize());

        return userRepository.save(user);
    }

    @Transactional
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + id));
        user.setStatus("inactive");
        userRepository.save(user);
    }
}
