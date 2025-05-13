package com.peekport.controller.user;

import com.peekport.model.User;
import com.peekport.service.UserService;
import com.peekport.config.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtUtil jwtUtil;
    private final UserService userService;

    @PostMapping("/register")
    public String register(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String password) {
        User user = userService.register(name, email, password);
        return "회원가입 성공: " + user.getEmail();
    }

    @PostMapping("/login")
    public String login(@RequestParam String email,
                        @RequestParam String password) {
        User user = userService.login(email, password);
        String token = jwtUtil.generateToken(user.getEmail());
        return token;
    }

    @GetMapping("/me")
    public String me() {
        return "내 정보 접근 성공 (JWT 인증됨)";
    }

}
