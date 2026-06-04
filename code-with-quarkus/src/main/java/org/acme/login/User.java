package org.acme.login;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "users") // MySQL에서 user는 예약어처럼 충돌 가능성이 있어서 users 사용
public class User extends PanacheEntity {

    // 사용자 아이디
    public String username;

    // 사용자 패스워드
    // 10주차에서는 실습용으로 평문 저장
    public String password;

    // username으로 사용자 1명 조회
    public static User findByUsername(String username) {
        return find("username", username).firstResult();
    }
}