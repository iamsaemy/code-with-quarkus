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
        // 실습용 초기 데이터 재등록
        Champion.deleteAll();
        User.deleteAll();

        // 챔피언 데이터
        persistChampion("아트록스", "Aatrox", "전사", "탑", "images/Aatrox.png", "상");

        persistChampion("사일러스", "Sylas", "마법사", "정글/미드",
                "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Sylas.png", "중");

        persistChampion("애니비아", "Anivia", "마법사", "미드",
                "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Anivia.png", "상");

        persistChampion("브라이어", "Briar", "전사", "정글",
                "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Briar.png", "중");

        persistChampion("잭스", "Jax", "전사", "탑",
                "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Jax.png", "하");

        persistChampion("징크스", "Jinx", "원거리딜러", "원딜",
                "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Jinx.png", "중");

        persistChampion("야스오", "Yasuo", "전사", "미드/탑",
                "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Yasuo.png", "상");

        persistChampion("리신", "LeeSin", "전사", "정글",
                "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/LeeSin.png", "상");

        persistChampion("티모", "Teemo", "마법사", "탑",
                "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Teemo.png", "하");

        persistChampion("케인", "Kayn", "암살자", "정글",
                "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Kayn.png", "중");

        persistChampion("루시안", "Lucian", "원거리딜러", "원딜/미드",
                "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Lucian.png", "중");

        // 10주차 로그인 실습용 사용자
        // 123123을 SHA-256으로 변환한 값
        persistUser("guest", "96cae35ce8a9b0244178bf28e4966c2ce1b8385723a96a6b838858cdd6ca0a1e");
    }

    // 챔피언 데이터 저장
    private void persistChampion(String name, String engName, String role, String line, String img, String difficulty) {
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
    private void persistUser(String username, String password) {
        User user = new User();
        user.username = username;
        user.password = password;
        user.persist();
    }
}