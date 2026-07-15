// package com.mangablade.backend.services.mangablade;

// import com.mangablade.backend.entities.User;
// import com.mangablade.backend.repositories.UserRepository;

// import org.springframework.security.core.userdetails.UserDetailsService;
// import org.springframework.security.core.userdetails.UsernameNotFoundException;

// import org.springframework.stereotype.Service;

// import lombok.RequiredArgsConstructor;

// @Service
// @RequiredArgsConstructor
// public class UserService implements UserDetailsService {

//     private final UserRepository userRepository;
//     @Override
//     public User loadUserByUsername(String email) throws UsernameNotFoundException {
//         return userRepository.findByEmail(email).orElseThrow( () -> new UsernameNotFoundException("User not found"));
//     }


// }
