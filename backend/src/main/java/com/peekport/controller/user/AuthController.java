package com.peekport.controller.user;

import com.peekport.dto.LoginRequest;
import com.peekport.dto.SignupRequest;
import com.peekport.model.User;
import com.peekport.service.UserService;
import com.peekport.config.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtUtil jwtUtil;
    private final UserService userService;

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
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userService.login(request.getEmail(), request.getPassword());
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return ResponseEntity.ok(Map.of("token", token)); // JSON 응답으로 리턴
    }

    @GetMapping("/me")
    public String me() {
        return "내 정보 접근 성공 (JWT 인증됨)";
    }

}
