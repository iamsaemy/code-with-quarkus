package org.acme.login;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User extends PanacheEntity {

    // 아이디
    @Column(unique = true)
    public String username;

    // 비밀번호: SHA-256 해시값 저장
    public String password;

    // 이메일: 중복 방지
    @Column(unique = true)
    public String email;

    // 연락처
    public String phone;

    // 12주차 15페이지: 프로필 이미지 파일명 저장
    public String profileImage;

    // 아이디로 사용자 조회
    public static User findByUsername(String username) {
        return find("username", username).firstResult();
    }

    // 이메일로 사용자 조회
    public static User findByEmail(String email) {
        return find("email", email).firstResult();
    }
}