package org.acme.common;

import org.acme.champion.Champion;
import org.acme.login.User;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class DataSeeder {

    @Transactional
    void onStart(@Observes StartupEvent ev) {
        /*
         * 추가 기능 구현 이후에는 deleteAll()을 사용하면 안 된다.
         *
         * 이유:
         * 1. 서버를 재시작할 때마다 champions, users 데이터가 삭제된다.
         * 2. champions의 id가 새로 생성된다.
         * 3. favorite_champions, recent_champions에 저장된 championId와 연결이 꼬일 수 있다.
         *
         * 따라서 데이터가 없을 때만 초기 데이터를 등록하는 방식으로 변경한다.
         */

        // 챔피언 데이터가 하나도 없을 때만 초기 챔피언 등록
        if (Champion.count() == 0) {
            persistChampion("아트록스", "Aatrox", "전사", "탑", "images/Aatrox.png", "상");

            persistChampion(
                    "사일러스",
                    "Sylas",
                    "마법사",
                    "정글/미드",
                    "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Sylas.png",
                    "중");

            persistChampion(
                    "애니비아",
                    "Anivia",
                    "마법사",
                    "미드",
                    "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Anivia.png",
                    "상");

            persistChampion(
                    "브라이어",
                    "Briar",
                    "전사",
                    "정글",
                    "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Briar.png",
                    "중");

            persistChampion(
                    "잭스",
                    "Jax",
                    "전사",
                    "탑",
                    "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Jax.png",
                    "하");

            persistChampion(
                    "징크스",
                    "Jinx",
                    "원거리딜러",
                    "원딜",
                    "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Jinx.png",
                    "중");

            persistChampion(
                    "야스오",
                    "Yasuo",
                    "전사",
                    "미드/탑",
                    "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Yasuo.png",
                    "상");

            persistChampion(
                    "리신",
                    "LeeSin",
                    "전사",
                    "정글",
                    "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/LeeSin.png",
                    "상");

            persistChampion(
                    "티모",
                    "Teemo",
                    "마법사",
                    "탑",
                    "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Teemo.png",
                    "하");

            persistChampion(
                    "케인",
                    "Kayn",
                    "암살자",
                    "정글",
                    "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Kayn.png",
                    "중");

            persistChampion(
                    "루시안",
                    "Lucian",
                    "원거리딜러",
                    "원딜/미드",
                    "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Lucian.png",
                    "중");

            System.out.println("=== 초기 챔피언 데이터 등록 완료 ===");
        } else {
            System.out.println("=== 기존 챔피언 데이터 유지 ===");
        }

        // guest 계정이 없을 때만 등록
        if (User.findByUsername("guest") == null) {
            /*
             * 비밀번호: 123qwe@@@
             * SHA-256:
             * 7680bf06962a60f8f9b099f3c951fee6a30e53d0ff39586eb32f256418a32b20
             */
            persistUser(
                    "guest",
                    "7680bf06962a60f8f9b099f3c951fee6a30e53d0ff39586eb32f256418a32b20",
                    "guest@example.com",
                    "010-0000-0000");

            System.out.println("=== guest 사용자 등록 완료 ===");
        } else {
            System.out.println("=== 기존 guest 사용자 유지 ===");
        }
    }

    // 챔피언 데이터 저장
    private void persistChampion(
            String name,
            String engName,
            String role,
            String line,
            String img,
            String difficulty) {

        Champion c = new Champion();
        c.name = name;
        c.engName = engName;
        c.role = role;
        c.line = line;
        c.img = img;
        c.difficulty = difficulty;
        c.persist();
    }

    // 사용자 데이터 저장
    private void persistUser(String username, String password, String email, String phone) {
        User user = new User();
        user.username = username;
        user.password = password;
        user.email = email;
        user.phone = phone;
        user.profileImage = null;
        user.persist();
    }
}