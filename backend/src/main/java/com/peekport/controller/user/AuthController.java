package com.peekport.controller.user;

import com.peekport.config.JwtUtil;
import com.peekport.dto.LoginRequest;
import com.peekport.dto.SignupRequest;
import com.peekport.dto.TokenResponse;
import com.peekport.model.User;
import com.peekport.repository.UserRepository;
import com.peekport.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    @PostMapping("/signup")
    public String register(@RequestBody SignupRequest request) {
        User user = userService.register(
                request.getName(),
                request.getEmail(),
                request.getPassword()
        );
        return "회원가입 성공: " + user.getEmail();
    }


    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("사용자 없음"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("비밀번호 불일치");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name()); // ✅ 역할 포함

        return ResponseEntity.ok(new TokenResponse(token));
    }


    @GetMapping("/me")
    public String me() {
        return "내 정보 접근 성공 (JWT 인증됨)";
    }

}
